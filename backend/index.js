const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const ENV = process.env.NODE_ENV || 'development';
dotenv.config({
  path: path.resolve(__dirname, `.env.${ENV}`)
});

const PORT = process.env.PORT || 5000;
const MAX_RETRIES = 20;   // for Sequelize connection
const RETRY_DELAY = 3000; // in ms

const waitForDB = require("./db/wait-for-db");

async function startServer(retries = MAX_RETRIES) {
  // 1. Wait for DB hardware/network to be ready
  await waitForDB();

  // 2. Give DB a few seconds to settle before heavy migrations
  console.log("⏳ DB ready, waiting 5s for stabilization...");
  await new Promise(resolve => setTimeout(resolve, 5000));

  // 3. Load app and models ONLY after DB is ready
  const app = require('./app');
  const db = require('./models');
  const erpDb = require('./models/ERP');

  while (retries > 0) {
    try {
      // 3. Authenticate Sequelize connections
      await db.sequelize.authenticate();
      console.log(`✅ Connected to ${ENV} database (HR)`);

      await erpDb.sequelize.authenticate();
      console.log(`✅ Connected to ${ENV} database (ERP)`);

      const FORCE_SYNC = process.env.DB_SYNC_FORCE === 'true';
      // Use safe sync (create missing tables only, no destructive alters).
      // `alter: true` re-adds foreign keys on every boot and fails on restored
      // data that has orphaned rows (e.g. emp_attendance). Force-sync (drop &
      // recreate) is opt-in via DB_SYNC_FORCE=true.
      const syncOptions = FORCE_SYNC ? { force: true } : { force: false };

      if (FORCE_SYNC) {
        console.warn('⚠️ WARNING: DB_SYNC_FORCE is enabled. All tables will be dropped and recreated!');
      }

      // 4. Pre-migration: drop stale defaults that block ENUM->STRING casting
      try {
        await erpDb.sequelize.query(`ALTER TABLE IF EXISTS t_material_requisition ALTER COLUMN status DROP DEFAULT`);
      } catch (_) { /* table may not exist yet */ }
      try {
        await erpDb.sequelize.query(`ALTER TABLE IF EXISTS t_material_issue ALTER COLUMN status DROP DEFAULT`);
      } catch (_) { /* table may not exist yet */ }

      // 4b. Pre-migration: add BOM costing columns if missing (safe, idempotent)
      const erpMigrations = [
        `ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS labour_cost DECIMAL(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS overhead_cost DECIMAL(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS overhead_is_percent BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS margin_percent DECIMAL(5,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS selling_price DECIMAL(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_bom_item ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(14,2)`,
        `ALTER TABLE IF EXISTS t_bom_item ADD COLUMN IF NOT EXISTS operation VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS product_id INTEGER`,
        `ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS item_id INTEGER`,
        `ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS category_id INTEGER`,
        // ── Item Master rebuild: drop legacy item tables ONLY when explicitly requested.
        // Running this on every boot would wipe imported item data, so it is gated behind
        // the REBUILD_ITEM_MASTER env flag (set it to 'true' for a one-time fresh rebuild). ──
        ...(process.env.REBUILD_ITEM_MASTER === 'true'
          ? [
              `DROP TABLE IF EXISTS m_item_subtype CASCADE`,
              `DROP TABLE IF EXISTS m_item_type CASCADE`,
              `DROP TABLE IF EXISTS m_item_category CASCADE`,
              `DROP TABLE IF EXISTS m_item_subgroup CASCADE`,
              `DROP TABLE IF EXISTS m_item_master CASCADE`,
            ]
          : []),
        // ── Item Master audit columns (idempotent; safe to run every boot) ──
        `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS created_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP`,
        `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS authorized_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS authorized_date TIMESTAMP`,
        `ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS node_type VARCHAR(20) NOT NULL DEFAULT 'SKU'`,
        `ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS parent_id INTEGER`,
        `ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS color VARCHAR(50)`,
        // ── Inward Register: rename legacy t_grn -> t_ir (GRR + Jobwork/Resharpening/Loan/Maintenance) ──
        `ALTER TABLE IF EXISTS t_grn RENAME TO t_ir`,
        `ALTER TABLE IF EXISTS t_grn_item RENAME TO t_ir_item`,
        `ALTER TABLE IF EXISTS t_stock_audit_item ALTER COLUMN item_id DROP NOT NULL`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS cost_posted BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'Pending'`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS approved_date DATE`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS approval_remarks TEXT`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS qa_status VARCHAR(20) NOT NULL DEFAULT 'Pending'`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS qa_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS qa_date DATE`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS qa_remarks TEXT`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS bill_no VARCHAR(20)`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS bill_date DATE`,
        `ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS ir_type VARCHAR(20) NOT NULL DEFAULT 'GRR'`,
        `ALTER TABLE IF EXISTS t_invoice ADD COLUMN IF NOT EXISTS paid_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid'`,
        // ── PR Amendment audit trail (idempotent) ──
        `CREATE TABLE IF NOT EXISTS t_pr_amendment (
          id SERIAL PRIMARY KEY,
          requisition_id INTEGER NOT NULL,
          amended_by VARCHAR(100),
          amendment_date TIMESTAMP,
          change_summary TEXT,
          old_value JSONB,
          new_value JSONB
        )`,
        `CREATE INDEX IF NOT EXISTS idx_pr_amendment_req ON t_pr_amendment (requisition_id)`,
        // ── Production/Job Order type classification (idempotent) ──
        `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) NOT NULL DEFAULT 'Job Order'`,
        // ── Rename created_at -> created_date (DATE) across all ERP tables ──
        `DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT table_name FROM information_schema.columns WHERE column_name = 'created_at' AND table_schema = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN created_at TO created_date', r.table_name);
    EXCEPTION WHEN others THEN END;
    BEGIN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN created_date TYPE DATE USING created_date::DATE', r.table_name);
    EXCEPTION WHEN others THEN END;
  END LOOP;
END $$;`,
        // ── PR form new columns (Apex-style) ──
        `ALTER TABLE IF EXISTS t_purchase_requisition ADD COLUMN IF NOT EXISTS sub_department VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS cost_center VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS uom VARCHAR(20)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS purpose VARCHAR(200)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS len DECIMAL(10,2)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS item_no VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS kg DECIMAL(12,3)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS mat_code VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS mat_desc VARCHAR(200)`,
        `ALTER TABLE IF EXISTS t_purchase_requisition_item ADD COLUMN IF NOT EXISTS est_cost DECIMAL(14,2)`,
        // ── Cost Center master table ──
        `CREATE TABLE IF NOT EXISTS m_cost_center (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          code VARCHAR(20),
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_date DATE DEFAULT CURRENT_DATE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
      ];
      for (const sql of erpMigrations) {
        try { await erpDb.sequelize.query(sql); } catch (_) { /* ignore */ }
      }

      // 4c. Drop any stale foreign keys that still reference the legacy
      // `m_supplier_master` table. Suppliers were migrated to `m_party_master`
      // (SupplierMaster model), so these orphaned FKs block every
      // supplier-linked insert (GRN, PO, RFQ, vendor rating, price list).
      // Idempotent — safe to run on every boot.
      try {
        await erpDb.sequelize.query(`
          DO $$
          DECLARE r RECORD;
          BEGIN
            FOR r IN
              SELECT conname, conrelid::regclass::text AS tbl
              FROM pg_constraint
              WHERE contype = 'f'
                AND confrelid = 'm_supplier_master'::regclass
            LOOP
              EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.tbl, r.conname);
            END LOOP;
          END $$;
        `);
      } catch (_) { /* ignore */ }

      // 5. Sync models (HR + ERP share the same database now)
      await db.sequelize.sync(syncOptions);
      console.log('✅ HR database synced.');

      await erpDb.sequelize.sync(syncOptions);
      console.log('✅ ERP database synced.');

      // 6. One-time data fix: drop obsolete Category/Model/SKU tree rows and normalize to PRODnnnn + new product_code
      try {
        const { ProductMaster, ProductCategory, Sequelize } = erpDb;
        const COLOR_CODES = { white: 'WT', black: 'BK', brown: 'BN', grey: 'GY', gray: 'GY', blue: 'BL', red: 'RD', green: 'GN', ivory: 'IV', silver: 'SV', gold: 'GD', golden: 'GD' };
        const buildCode = (subName, color, seq) => {
          const prefix = (subName || 'PROD').toString().trim().split(/\s+/)[0].toUpperCase();
          const cc = color ? (COLOR_CODES[color.toString().toLowerCase()] || color.toString().slice(0, 2).toUpperCase()) : '';
          return cc ? `${prefix}-${cc}-${String(seq).padStart(3, '0')}` : `${prefix}-${String(seq).padStart(3, '0')}`;
        };
        // Remove legacy tree nodes (Category/Model/color-SKU) — now represented by Main/Sub categories
        const removed = await ProductMaster.destroy({
          where: Sequelize.or(
            Sequelize.where(Sequelize.col('product_uid'), 'LIKE', 'CAT%'),
            Sequelize.where(Sequelize.col('product_uid'), 'LIKE', 'MOD%'),
            Sequelize.where(Sequelize.col('product_uid'), 'LIKE', 'SKU%'),
            { node_type: 'Category' },
            { node_type: 'Model' }
          ),
        });
        if (removed) console.log(`✅ Removed ${removed} obsolete Category/Model/SKU row(s).`);

        // Renumber all remaining products from PROD0001 and rebuild product_code per sub-category
        const all = await ProductMaster.findAll({ order: [['id', 'ASC']] });
        const catSeq = {};
        const catCache = {};
        let n = 0;
        for (const row of all) {
          n += 1;
          const uid = `PROD${String(n).padStart(4, '0')}`;
          const catId = row.category_id;
          catSeq[catId] = (catSeq[catId] || 0) + 1;
          if (!catCache[catId] && catId) catCache[catId] = await ProductCategory.findByPk(catId);
          const subName = catCache[catId] ? catCache[catId].name : '';
          const code = buildCode(subName, row.color, catSeq[catId]);
          const changes = {};
          if (row.product_uid !== uid) changes.product_uid = uid;
          if (row.product_code !== code) changes.product_code = code;
          if (Object.keys(changes).length) await row.update(changes);
        }
        if (n) console.log(`✅ Normalized ${n} ProductMaster row(s) to PROD sequence + product_code.`);
      } catch (_) { /* non-fatal */ }

      // 7. Seed Item Master 4-level classification (Group -> Sub Group -> Type -> Sub Type) + sample items
      try {
        const { ItemGroup, ItemSubGroup, ItemType, ItemSubType, Unit, ItemMaster, Op } = erpDb;

        // Group -> Sub Group -> Type -> Sub Type taxonomy (placeholder; replace with Excel data)
        const TAXONOMY = [
          {
            name: 'Raw Material', subGroups: [
              { name: 'Metal & Sheet', types: [{ name: 'CR Sheet', subTypes: ['CRCA', 'GP Sheet'] }, { name: 'Aluminium', subTypes: ['Coil', 'Extrusion'] }] },
              { name: 'Plastic & Polymer', types: [{ name: 'PP Granules', subTypes: ['Natural', 'Coloured'] }, { name: 'ABS', subTypes: ['Natural'] }] },
              { name: 'Electrical', types: [{ name: 'Motor', subTypes: ['BLDC', 'AC'] }, { name: 'Capacitor', subTypes: ['Start', 'Run'] }] },
            ],
          },
          {
            name: 'Sub Assembly', subGroups: [
              { name: 'Mechanical', types: [{ name: 'Shaft Assembly', subTypes: ['Balanced', 'Unbalanced'] }] },
              { name: 'Electrical', types: [{ name: 'Wiring Harness', subTypes: ['Fan', 'Controller'] }] },
            ],
          },
          {
            name: 'Packing Material', subGroups: [
              { name: 'Covers', types: [{ name: 'Packing Cover', subTypes: ['PE Cover', 'Bubble Wrap'] }] },
              { name: 'Carton', types: [{ name: 'Carton Box', subTypes: ['5 Ply', '7 Ply', 'Monocharton'] }] },
              { name: 'Label', types: [{ name: 'Sticker', subTypes: ['Brand', 'Rating'] }] },
            ],
          },
          {
            name: 'Consumables', subGroups: [
              { name: 'Tools', types: [{ name: 'Consumable Tool', subTypes: ['Drill', 'Bit'] }] },
              { name: 'Stationery', types: [{ name: 'General', subTypes: ['Tape', 'Marker'] }] },
            ],
          },
          {
            name: 'Finished Goods', subGroups: [
              { name: 'Fan', types: [{ name: 'Table Fan', subTypes: ['12 Inch', '16 Inch'] }, { name: 'Pedestal Fan', subTypes: ['16 Inch'] }, { name: 'Tower Fan', subTypes: ['Standard'] }] },
            ],
          },
          {
            name: 'Spares', subGroups: [
              { name: 'Service', types: [{ name: 'Spare Part', subTypes: ['Bearing', 'Capacitor'] }] },
            ],
          },
        ];

        const findOrCreate = async (Model, where, defaults) => {
          const [rec] = await Model.findOrCreate({ where, defaults });
          return rec;
        };

        for (const g of TAXONOMY) {
          const group = await findOrCreate(ItemGroup, { name: g.name }, { name: g.name, is_active: true });
          for (const sg of g.subGroups) {
            const subGroup = await findOrCreate(ItemSubGroup, { name: sg.name, group_id: group.id }, { name: sg.name, group_id: group.id, is_active: true });
            for (const t of sg.types) {
              const type = await findOrCreate(ItemType, { name: t.name, subgroup_id: subGroup.id }, { name: t.name, subgroup_id: subGroup.id, is_active: true });
              for (const st of t.subTypes) {
                await findOrCreate(ItemSubType, { name: st, type_id: type.id }, { name: st, type_id: type.id, is_active: true });
              }
            }
          }
        }
        console.log('✅ Seeded Item Master 4-level classification.');

        // A couple of sample items (replace with Excel bulk import)
        const nos = await findOrCreate(Unit, { name: 'Nos' }, { name: 'Nos', short_name: 'NOS' });
        const fanType = await ItemType.findOne({ where: { name: 'Table Fan' } });
        const fanSub = fanType && await ItemSubType.findOne({ where: { name: '16 Inch', type_id: fanType.id } });
        const fanGroup = await ItemGroup.findOne({ where: { name: 'Finished Goods' } });
        const fanSG = fanGroup && await ItemSubGroup.findOne({ where: { name: 'Fan', group_id: fanGroup.id } });
        const existing = await ItemMaster.count({ where: { item_code: 'FG-TABLE-16' } });
        if (!existing) {
          await ItemMaster.create({
            item_code: 'FG-TABLE-16',
            item_name: 'Table Fan 16 Inch',
            item_description: 'Sample finished good',
            group_id: fanGroup ? fanGroup.id : null,
            subgroup_id: fanSG ? fanSG.id : null,
            type_id: fanType ? fanType.id : null,
            subtype_id: fanSub ? fanSub.id : null,
            unit_id: nos.id,
            hsn_code: '841451',
            gst_rate: 18,
            current_stock: 0,
            valuation_method: 'Moving Average',
          });
          console.log('✅ Seeded sample item FG-TABLE-16.');
        }
      } catch (_) { /* non-fatal */ }

      // 8. Seed default UOMs (Units)
      try {
        const { Unit } = erpDb;
        const UOMS = [
          { name: 'Nos', short_name: 'NOS' }, { name: 'Pieces', short_name: 'PCS' },
          { name: 'Kilogram', short_name: 'KGS' }, { name: 'Gram', short_name: 'GRM' },
          { name: 'Meter', short_name: 'MTR' }, { name: 'Centimeter', short_name: 'CMT' },
          { name: 'Liter', short_name: 'LTR' }, { name: 'Milliliter', short_name: 'MLT' },
          { name: 'Set', short_name: 'SET' }, { name: 'Pair', short_name: 'PRS' },
          { name: 'Box', short_name: 'BOX' }, { name: 'Dozen', short_name: 'DOZ' },
          { name: 'Feet', short_name: 'FTT' }, { name: 'Square Feet', short_name: 'SQF' },
          { name: 'Roll', short_name: 'ROL' }, { name: 'Bundle', short_name: 'BDL' },
        ];
        for (const u of UOMS) {
          const ex = await Unit.findOne({ where: { name: u.name } });
          if (!ex) await Unit.create({ name: u.name, short_name: u.short_name, is_active: true });
        }
        console.log(`✅ Seeded ${UOMS.length} default UOM(s).`);
        // Normalize any existing short codes to uppercase, max 3 letters
        try {
          await erpDb.sequelize.query(`UPDATE m_unit SET short_name = UPPER(LEFT(short_name, 3)) WHERE short_name IS NOT NULL`);
          // Fix any 2-letter codes that need a standard 3-letter form
          const SHORT_FIX = { KG: 'KGS', GM: 'GRM', ML: 'MLT', PR: 'PRS', FT: 'FTT', CM: 'CMT' };
          for (const [old, neu] of Object.entries(SHORT_FIX)) {
            await erpDb.sequelize.query(`UPDATE m_unit SET short_name = '${neu}' WHERE short_name = '${old}'`);
          }
        } catch (_) { /* non-fatal */ }
      } catch (_) { /* non-fatal */ }

      // 9. Seed default Item Types
      try {
        const { ItemType } = erpDb;
        const TYPES = ['Material', 'Raw Material', 'Consumables', 'Consumable Tools', 'Components', 'Packing', 'Semi-Finished', 'Finished Goods', 'Spares'];
        for (const name of TYPES) {
          const ex = await ItemType.findOne({ where: { name } });
          if (!ex) await ItemType.create({ name, is_active: true });
        }
        console.log(`✅ Seeded ${TYPES.length} default item type(s).`);
      } catch (_) { /* non-fatal */ }

      // 5. Start listening
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
      });
      break;
    } catch (error) {
      console.error(`❌ DB connection failed (${MAX_RETRIES - retries + 1}):`, error.message);
      retries--;
      if (retries === 0) {
        console.error('❌ Max retries reached. Exiting...');
        process.exit(1);
      }
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

startServer();

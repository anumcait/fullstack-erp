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
  const accountsDb = require('./models/Accounts');

  while (retries > 0) {
    try {
      // 3. Authenticate Sequelize connections
      await db.sequelize.authenticate();
      console.log(`✅ Connected to ${ENV} database (HR)`);

      await erpDb.sequelize.authenticate({ logging: console.log });
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
        // ── Inward Register: rename legacy t_grn -> ir (GRR + Jobwork/Resharpening/Loan/Maintenance) ──
        `ALTER TABLE IF EXISTS t_grn RENAME TO ir`,
        `ALTER TABLE IF EXISTS t_grn_item RENAME TO t_ir_item`,
        // ── IR naming: unify table `ir` and column `ir_no` (idempotent) ──
        `DO $$ BEGIN IF to_regclass('t_ir') IS NOT NULL AND to_regclass('ir') IS NULL THEN ALTER TABLE t_ir RENAME TO ir; END IF; END $$`,
        `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'ir' AND column_name = 'grn_no') THEN ALTER TABLE ir RENAME COLUMN grn_no TO ir_no; END IF; END $$`,
        `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'ir' AND column_name = 'grn_date') THEN ALTER TABLE ir RENAME COLUMN grn_date TO ir_date; END IF; END $$`,
        // ── IR naming: re-point item/link FKs to `ir` if they still reference the old `t_ir` table ──
        `DO $$
         DECLARE ref TEXT;
         BEGIN
           SELECT confrelid::regclass::text INTO ref FROM pg_constraint WHERE conname = 't_ir_item_grn_id_fkey';
           IF ref = 't_ir' THEN
             ALTER TABLE t_ir_item DROP CONSTRAINT t_ir_item_grn_id_fkey;
             ALTER TABLE t_ir_item ADD CONSTRAINT t_ir_item_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES ir(id) ON UPDATE CASCADE ON DELETE CASCADE;
           END IF;
         END $$;`,
        `DO $$
         DECLARE ref TEXT;
         BEGIN
           SELECT confrelid::regclass::text INTO ref FROM pg_constraint WHERE conname = 't_ir_dc_ir_id_fkey';
           IF ref = 't_ir' THEN
             ALTER TABLE t_ir_dc DROP CONSTRAINT t_ir_dc_ir_id_fkey;
             ALTER TABLE t_ir_dc ADD CONSTRAINT t_ir_dc_ir_id_fkey FOREIGN KEY (ir_id) REFERENCES ir(id) ON DELETE CASCADE;
           END IF;
         END $$;`,
        // ── Inward Register (DC-based): add dc_type + DC link columns to existing ir ──
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS dc_type VARCHAR(20) NOT NULL DEFAULT 'L'`,
        `ALTER TABLE IF EXISTS ir_item ADD COLUMN IF NOT EXISTS dc_id INTEGER`,
        `ALTER TABLE IF EXISTS ir_item ADD COLUMN IF NOT EXISTS dc_item_id INTEGER`,
        `ALTER TABLE IF EXISTS ir_item ADD COLUMN IF NOT EXISTS qty_supplied DECIMAL(18,4) DEFAULT 0`,
        `ALTER TABLE IF EXISTS ir_item ADD COLUMN IF NOT EXISTS dc_qty DECIMAL(18,4) DEFAULT 0`,
        `ALTER TABLE IF EXISTS ir_item ADD COLUMN IF NOT EXISTS unit_id INTEGER`,
        `ALTER TABLE IF EXISTS ir_item ADD COLUMN IF NOT EXISTS uom VARCHAR(20)`,
        `CREATE TABLE IF NOT EXISTS t_ir_dc (
          ir_id INTEGER NOT NULL,
          dc_id INTEGER NOT NULL,
          PRIMARY KEY (ir_id, dc_id),
          FOREIGN KEY (ir_id) REFERENCES ir(id) ON DELETE CASCADE,
          FOREIGN KEY (dc_id) REFERENCES t_delivery_challan(id) ON DELETE CASCADE
        )`,
        `ALTER TABLE IF EXISTS t_stock_audit_item ALTER COLUMN item_id DROP NOT NULL`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS cost_posted BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'Pending'`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS approved_date DATE`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS cancel_remarks TEXT`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS cancel_by VARCHAR(100)`,
         `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS cancel_date TIMESTAMPTZ`,
         `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS inward_date DATE`,
         `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS approval_remarks TEXT`,
         `ALTER TABLE IF EXISTS ir_item ADD COLUMN IF NOT EXISTS work_order VARCHAR(50)`,
         `ALTER TABLE IF EXISTS ir_item ADD COLUMN IF NOT EXISTS opening DECIMAL(12,3) DEFAULT 0`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS qa_status VARCHAR(20) NOT NULL DEFAULT 'Pending'`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS qa_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS qa_date DATE`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS qa_remarks TEXT`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS bill_no VARCHAR(20)`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS bill_date DATE`,
        `ALTER TABLE IF EXISTS ir ADD COLUMN IF NOT EXISTS ir_type VARCHAR(20) NOT NULL DEFAULT 'GRR'`,
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
        // ── Job Order type classification (idempotent) ──
        `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) NOT NULL DEFAULT 'Job Order'`,
        `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS party_id INTEGER`,
        `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS party_name VARCHAR(200)`,
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
        // ── Subcontract receipt item: accepted quantity ──
        `ALTER TABLE IF EXISTS t_subcontract_receipt_item ADD COLUMN IF NOT EXISTS accepted_qty DECIMAL(12,2)`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS hs_code VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS pr_no VARCHAR(50)`,
        // ── PO line-item invoice columns (weights, discount, PF, tax split) ──
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS act_wt NUMERIC(12,3) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS off_wt NUMERIC(12,3) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS disc_percent NUMERIC(5,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS disc_inr NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS after_disc NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS pf_percent NUMERIC(5,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS pf_inr NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS taxable_value NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS sgst_rate NUMERIC(5,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS sgst_inr NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS cgst_rate NUMERIC(5,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS cgst_inr NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS igst_rate NUMERIC(5,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS igst_inr NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS total_value NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS req_date DATE`,
        `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS remarks TEXT`,
        // ── PO date now stores time (TIMESTAMP) ──
        `ALTER TABLE IF EXISTS t_purchase_order ALTER COLUMN po_date TYPE TIMESTAMP USING po_date::TIMESTAMP`,
        `ALTER TABLE IF EXISTS t_purchase_order ADD COLUMN IF NOT EXISTS req_date DATE`,
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
        // ── Company settings: logo ──
        `ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS logo_url TEXT`,
        `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'm_company_settings' AND table_schema = 'public') THEN UPDATE m_company_settings SET logo_url = '/logo.png' WHERE logo_url IS NULL OR logo_url = ''; END IF; END $$;`,
        // ── Sequence counters (row-level locking for concurrent-safe auto-numbering) ──
        `CREATE TABLE IF NOT EXISTS t_sequence_counters (
          id SERIAL PRIMARY KEY,
          prefix VARCHAR(20) NOT NULL,
          financial_year VARCHAR(20) NOT NULL,
          last_number INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(prefix, financial_year)
        )`,
        `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS req_date DATE`,
        `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS jo_date DATE`,
        `ALTER TABLE IF EXISTS t_production_order ALTER COLUMN bom_id DROP NOT NULL`,
        `ALTER TABLE IF EXISTS t_production_order ALTER COLUMN product_item_id DROP NOT NULL`,
        `ALTER TABLE IF EXISTS t_production_order ALTER COLUMN product_code DROP NOT NULL`,
        `ALTER TABLE IF EXISTS t_production_order ALTER COLUMN product_name DROP NOT NULL`,
        // ── Cost Center master table ──
        `CREATE TABLE IF NOT EXISTS m_cost_center (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          code VARCHAR(20),
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_date DATE DEFAULT CURRENT_DATE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        // ── Stores Settings: GRR prefix & auto-generate ──
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS grn_prefix VARCHAR(10) NOT NULL DEFAULT 'GRR'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_grn BOOLEAN NOT NULL DEFAULT FALSE`,
        // ── Stores Settings: extended (centralised config) ──
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS dc_prefix_sale_approval VARCHAR(10) NOT NULL DEFAULT 'SA'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS dc_prefix_labour VARCHAR(10) NOT NULL DEFAULT 'DCL'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS dc_prefix_repair VARCHAR(10) NOT NULL DEFAULT 'DCR'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS dc_prefix_maintenance VARCHAR(10) NOT NULL DEFAULT 'DCM'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS dc_prefix_jobwork VARCHAR(10) NOT NULL DEFAULT 'DCJ'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS dc_prefix_nonreturn VARCHAR(10) NOT NULL DEFAULT 'DCN'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_mr BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_mi BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_pr BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_po BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_rfq BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_dc BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_ir BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_bill BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_qc BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_audit BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_adj BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_transfer BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS default_warehouse VARCHAR(100) NOT NULL DEFAULT 'Main Store'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS bin_location_required BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS enforce_bin_on_receipt BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS enforce_bin_on_issue BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS allow_multi_warehouse BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS valuation_method VARCHAR(20) NOT NULL DEFAULT 'WEIGHTED_AVERAGE'`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS standard_cost_update_on_grn BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS decimal_precision_qty INTEGER NOT NULL DEFAULT 3`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS decimal_precision_cost INTEGER NOT NULL DEFAULT 4`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS batch_tracking_enabled BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS enforce_batch_on_receipt BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS enforce_batch_on_issue BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS enforce_fefo_on_issue BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS expiry_warning_days INTEGER NOT NULL DEFAULT 30`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS serial_tracking_enabled BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS enforce_serial_on_issue BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS negative_stock_allowed BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS allow_backdated_entries BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS max_backdate_days INTEGER NOT NULL DEFAULT 30`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS low_stock_alert BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS reorder_auto_create_pr BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS stock_reservation_enabled BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS grn_requires_qa BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS grn_requires_approval BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS mi_requires_approval BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS dc_requires_approval BOOLEAN NOT NULL DEFAULT FALSE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS stock_adj_requires_approval BOOLEAN NOT NULL DEFAULT TRUE`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS stock_adj_approval_limit NUMERIC(14,2) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS aging_bucket_days INTEGER NOT NULL DEFAULT 30`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS slow_moving_months INTEGER NOT NULL DEFAULT 3`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS dead_stock_days INTEGER NOT NULL DEFAULT 90`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS default_min_stock NUMERIC(14,3) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS default_reorder_level NUMERIC(14,3) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS default_max_stock NUMERIC(14,3) NOT NULL DEFAULT 0`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS default_uom_id INTEGER`,
        // ── Stores Settings: all document prefixes (nullable) ──
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS mr_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS mi_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS pr_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS po_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS rfq_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS ir_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS ge_prefix_in VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS ge_prefix_out VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS bill_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS qc_prefix_iqc VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS qc_prefix_ipc VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS qc_prefix_fqc VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS audit_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS stock_adj_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS transfer_prefix VARCHAR(10)`,
        // ── Stores Settings: document start numbers (Zoho-style) ──
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS mr_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS mi_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS grn_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS pr_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS po_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS rfq_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS ir_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS ge_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS audit_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS bill_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS adj_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS transfer_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS voucher_prefix VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS voucher_start_no INTEGER NOT NULL DEFAULT 1`,
        `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_voucher BOOLEAN NOT NULL DEFAULT FALSE`,
        // ── Misc / Petty Cash Voucher ──
        `CREATE TABLE IF NOT EXISTS t_misc_voucher (
          id SERIAL PRIMARY KEY,
          voucher_no VARCHAR(50) NOT NULL UNIQUE,
          voucher_date DATE NOT NULL,
          voucher_type VARCHAR(20) NOT NULL DEFAULT 'Miscellaneous',
          party_name VARCHAR(200),
          remarks TEXT,
          total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
          status VARCHAR(20) NOT NULL DEFAULT 'Draft',
          approved_by VARCHAR(100),
          approved_date TIMESTAMPTZ,
          cancel_remarks TEXT,
          created_by VARCHAR(100),
          created_date DATE DEFAULT CURRENT_DATE,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )`,
        `CREATE TABLE IF NOT EXISTS t_misc_voucher_item (
          id SERIAL PRIMARY KEY,
          voucher_id INTEGER NOT NULL,
          description VARCHAR(255) NOT NULL,
          amount DECIMAL(14,2) NOT NULL DEFAULT 0,
          remarks VARCHAR(255),
          CONSTRAINT fk_misc_voucher_item FOREIGN KEY (voucher_id) REFERENCES t_misc_voucher(id) ON DELETE CASCADE
        )`,
        `CREATE INDEX IF NOT EXISTS idx_misc_voucher_date ON t_misc_voucher (voucher_date)`,
        // ── Material Issue: issue_date stores time (TIMESTAMP) ──
        `ALTER TABLE IF EXISTS t_material_issue ALTER COLUMN issue_date TYPE timestamptz USING issue_date::timestamptz`,
        `ALTER TABLE IF EXISTS t_material_issue ADD COLUMN IF NOT EXISTS issue_type VARCHAR(20) NOT NULL DEFAULT 'General'`,
        // ── Job Order: old JO number and year reference ──
        `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS old_jo_no VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS jo_year VARCHAR(10)`,
        // ── Delivery Challan: prepared_by column + dc_date stores local datetime ──
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS prepared_by VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS maintenance_type VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS cancel_remarks TEXT`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS cancel_by VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS cancel_date TIMESTAMPTZ`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS approved_date TIMESTAMPTZ`,
        `ALTER TABLE IF EXISTS t_delivery_challan ALTER COLUMN dc_no DROP NOT NULL`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS draft_no VARCHAR(30)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS non_returnable_type VARCHAR(30)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS authorization_ref VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS transfer_location VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ADD COLUMN IF NOT EXISTS through VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_delivery_challan_item ADD COLUMN IF NOT EXISTS order_prod_qty DECIMAL(12,2)`,
        `ALTER TABLE IF EXISTS t_delivery_challan ALTER COLUMN dc_date TYPE timestamptz USING dc_date::timestamp`,
        `ALTER TABLE IF EXISTS t_delivery_challan_item ADD COLUMN IF NOT EXISTS unit_id INTEGER`,
        `ALTER TABLE IF EXISTS t_delivery_challan_item ADD COLUMN IF NOT EXISTS unit VARCHAR(20)`,
        `ALTER TABLE IF EXISTS t_delivery_challan_item ADD COLUMN IF NOT EXISTS tag VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_delivery_challan_item ADD COLUMN IF NOT EXISTS opn1 VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_delivery_challan_item ADD COLUMN IF NOT EXISTS opn2 VARCHAR(50)`,
        `ALTER TABLE IF EXISTS t_delivery_challan_item ADD COLUMN IF NOT EXISTS opn3 VARCHAR(50)`,
        `UPDATE t_delivery_challan SET status = 'Approved' WHERE status = 'Issued'`,
        // ── Load Sheets: header columns for the Oracle-style entry form ──
        `ALTER TABLE IF EXISTS t_load_sheet ADD COLUMN IF NOT EXISTS unit_no VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_load_sheet ADD COLUMN IF NOT EXISTS entry_by VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_load_sheet ADD COLUMN IF NOT EXISTS opt_no VARCHAR(100)`,
        `ALTER TABLE IF EXISTS t_load_sheet ALTER COLUMN status TYPE VARCHAR(20) USING status::text`,
        `ALTER TABLE IF EXISTS t_load_sheet ALTER COLUMN status SET DEFAULT 'Draft'`,
        // ── Machine Master: Oracle-style extended columns ──
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS unit_no VARCHAR(50)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS department_code VARCHAR(50)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS sub_type VARCHAR(50)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS hour_rate DECIMAL(12,2)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS installed_cap_cost DECIMAL(14,2)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS traverses VARCHAR(50)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS max_safe_load DECIMAL(14,2)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS hours_per_day DECIMAL(8,2)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS year_of_manufacturing VARCHAR(10)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS machine_group VARCHAR(100)`,
        `ALTER TABLE IF EXISTS m_production_machine ADD COLUMN IF NOT EXISTS sub_group VARCHAR(100)`,
      ];
      for (const sql of erpMigrations) {
        try { await erpDb.sequelize.query(sql); } catch (_) { /* ignore */ }
      }

      // 4b2. HR DB migrations (m_company_settings lives in the HR database)
      try {
        await db.sequelize.query(`ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS cin VARCHAR(30)`);
        await db.sequelize.query(`ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS pan VARCHAR(15)`);
        await db.sequelize.query(`ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS show_format_no BOOLEAN NOT NULL DEFAULT TRUE`);
        await db.sequelize.query(`ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS pf_number VARCHAR(100)`);
        await db.sequelize.query(`ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS esi_number VARCHAR(100)`);
        await db.sequelize.query(`ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS payroll_pt_rate DECIMAL(10,2) DEFAULT 200`);
        await db.sequelize.query(`ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS payroll_ot_multiplier DECIMAL(10,2) DEFAULT 1.5`);
        await db.sequelize.query(`ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS c_last_update TIMESTAMP`);

        // Align legacy HR module tables created with `created_date` (older raw
        // schema) with the models/controllers which expect `created_at`.
        const hrLegacyTables = [
          't_pf_ledger', 't_pf_challan',
          't_attendance_raw_punch', 't_punch_batch',
          't_disciplinary_case', 't_show_cause', 't_disciplinary_action',
          't_kra_template', 't_kra_template_item', 't_appraisal_cycle', 't_appraisal', 't_appraisal_rating',
          't_training_course', 't_training_session', 't_training_participant', 't_certification', 't_skill_matrix',
          't_exit_application', 't_exit_clearance', 't_final_settlement',
          't_job_requisition', 't_candidate', 't_interview', 't_offer_letter',
          't_emp_tax_regime', 't_emp_tax_investment', 't_emp_tax_computation',
          'esi_leave_permission',
        ];
        for (const tbl of hrLegacyTables) {
          await db.sequelize.query(
            `DO $$ BEGIN IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = '${tbl}' AND column_name = 'created_date') AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = '${tbl}' AND column_name = 'created_at') THEN ALTER TABLE "${tbl}" RENAME COLUMN created_date TO created_at; END IF; END $$`
          );
        }
      } catch (_) { /* ignore */ }

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
            IF to_regclass('m_supplier_master') IS NOT NULL THEN
              FOR r IN
                SELECT conname, conrelid::regclass::text AS tbl
                FROM pg_constraint
                WHERE contype = 'f'
                  AND confrelid = 'm_supplier_master'::regclass
              LOOP
                EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.tbl, r.conname);
              END LOOP;
            END IF;
          END $$;
        `);
      } catch (_) { /* ignore */ }

      // 5. Sync models (HR + ERP share the same database now)
      await db.sequelize.sync(syncOptions);
      console.log('✅ HR database synced.');

      await erpDb.sequelize.sync(syncOptions);
      console.log('✅ ERP database synced.');

      await accountsDb.sequelize.sync(syncOptions);
      console.log('✅ Accounts database synced.');

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

      // 9b. Seed default Warehouse(s)
      try {
        const { Warehouse } = erpDb;
        const WAREHOUSES = [
          { warehouse_code: 'WH-001', warehouse_name: 'Main Store', location: 'Main Facility' },
          { warehouse_code: 'WH-002', warehouse_name: 'Raw Material Store', location: 'Main Facility' },
        ];
        for (const w of WAREHOUSES) {
          const ex = await Warehouse.findOne({ where: { warehouse_code: w.warehouse_code } });
          if (!ex) await Warehouse.create({ ...w, is_active: true });
        }
        console.log(`✅ Seeded ${WAREHOUSES.length} default warehouse(s).`);
      } catch (_) { /* non-fatal */ }

      // 10. Seed Accounts module defaults (voucher types + chart of accounts)
      try {
        const { VoucherType, ChartOfAccount, FinancialYear, AccountsSettings } = db;

        const VOUCHER_TYPES = [
          { code: 'SI', name: 'Sales Invoice' },
          { code: 'PI', name: 'Purchase Invoice' },
          { code: 'DN', name: 'Debit Note' },
          { code: 'CN', name: 'Credit Note' },
          { code: 'PV', name: 'Payment Voucher' },
          { code: 'RV', name: 'Receipt Voucher' },
          { code: 'JV', name: 'Journal Voucher' },
          { code: 'CV', name: 'Contra Voucher' },
        ];
        for (const vt of VOUCHER_TYPES) {
          await VoucherType.findOrCreate({ where: { code: vt.code }, defaults: { ...vt, is_active: true } });
        }
        console.log(`✅ Seeded ${VOUCHER_TYPES.length} voucher type(s).`);

        const DEFAULT_COA = [
          { account_code: '1000', account_name: 'Current Assets', account_type: 'Asset', is_group: true },
          { account_code: '1100', account_name: 'Cash & Bank', account_type: 'Asset', is_group: true },
          { account_code: '1101', account_name: 'Cash in Hand', account_type: 'Asset', parent_code: '1100' },
          { account_code: '1102', account_name: 'Bank Account', account_type: 'Asset', parent_code: '1100' },
          { account_code: '1200', account_name: 'Accounts Receivable', account_type: 'Asset', is_group: true },
          { account_code: '1201', account_name: 'Sundry Debtors', account_type: 'Asset', parent_code: '1200' },
          { account_code: '1300', account_name: 'Inventory', account_type: 'Asset', is_group: true },
          { account_code: '1301', account_name: 'Raw Materials', account_type: 'Asset', parent_code: '1300' },
          { account_code: '1302', account_name: 'Finished Goods', account_type: 'Asset', parent_code: '1300' },
          { account_code: '1400', account_name: 'Fixed Assets', account_type: 'Asset', is_group: true },
          { account_code: '1401', account_name: 'Plant & Machinery', account_type: 'Asset', parent_code: '1400' },
          { account_code: '1402', account_name: 'Furniture & Fixtures', account_type: 'Asset', parent_code: '1400' },
          { account_code: '1403', account_name: 'Computers & Peripherals', account_type: 'Asset', parent_code: '1400' },
          { account_code: '2000', account_name: 'Current Liabilities', account_type: 'Liability', is_group: true },
          { account_code: '2100', account_name: 'Accounts Payable', account_type: 'Liability', is_group: true },
          { account_code: '2101', account_name: 'Sundry Creditors', account_type: 'Liability', parent_code: '2100' },
          { account_code: '2200', account_name: 'Short Term Borrowings', account_type: 'Liability', is_group: true },
          { account_code: '2201', account_name: 'Bank OD / CC', account_type: 'Liability', parent_code: '2200' },
          { account_code: '2300', account_name: 'Provisions', account_type: 'Liability', is_group: true },
          { account_code: '2301', account_name: 'GST Payable', account_type: 'Liability', parent_code: '2300' },
          { account_code: '2302', account_name: 'TDS Payable', account_type: 'Liability', parent_code: '2300' },
          { account_code: '2400', account_name: 'Long Term Liabilities', account_type: 'Liability', is_group: true },
          { account_code: '2401', account_name: 'Term Loan', account_type: 'Liability', parent_code: '2400' },
          { account_code: '3000', account_name: 'Equity & Reserves', account_type: 'Equity', is_group: true },
          { account_code: '3100', account_name: 'Capital Account', account_type: 'Equity', parent_code: '3000' },
          { account_code: '3200', account_name: 'Retained Earnings', account_type: 'Equity', parent_code: '3000' },
          { account_code: '4000', account_name: 'Income', account_type: 'Income', is_group: true },
          { account_code: '4100', account_name: 'Sales Revenue', account_type: 'Income', parent_code: '4000' },
          { account_code: '4200', account_name: 'Other Income', account_type: 'Income', parent_code: '4000' },
          { account_code: '5000', account_name: 'Expenses', account_type: 'Expense', is_group: true },
          { account_code: '5100', account_name: 'Direct Expenses', account_type: 'Expense', parent_code: '5000' },
          { account_code: '5101', account_name: 'Raw Material Consumed', account_type: 'Expense', parent_code: '5100' },
          { account_code: '5102', account_name: 'Manufacturing Expenses', account_type: 'Expense', parent_code: '5100' },
          { account_code: '5200', account_name: 'Indirect Expenses', account_type: 'Expense', parent_code: '5000' },
          { account_code: '5201', account_name: 'Salary & Wages', account_type: 'Expense', parent_code: '5200' },
          { account_code: '5202', account_name: 'Rent', account_type: 'Expense', parent_code: '5200' },
          { account_code: '5203', account_name: 'Electricity', account_type: 'Expense', parent_code: '5200' },
          { account_code: '5204', account_name: 'Office Expenses', account_type: 'Expense', parent_code: '5200' },
          { account_code: '5205', account_name: 'Travel & Conveyance', account_type: 'Expense', parent_code: '5200' },
          { account_code: '5206', account_name: 'Legal & Professional', account_type: 'Expense', parent_code: '5200' },
        ];

        // Build COA with parent lookup by code
        const coaCache = {};
        for (const def of DEFAULT_COA) {
          let parent_id = null;
          if (def.parent_code) {
            parent_id = coaCache[def.parent_code];
          }
          const [coa] = await ChartOfAccount.findOrCreate({
            where: { account_code: def.account_code },
            defaults: { account_code: def.account_code, account_name: def.account_name, account_type: def.account_type, is_group: def.is_group || false, parent_id, is_active: true },
          });
          coaCache[def.account_code] = coa.id;
        }
        console.log(`✅ Seeded ${DEFAULT_COA.length} chart of account(s).`);

        // Financial year (current if not exists)
        const now = new Date();
        const fyName = `${now.getFullYear()}-${String(now.getFullYear() + 1).slice(2)}`;
        const fyStart = `${now.getFullYear()}-04-01`;
        const fyEnd = `${now.getFullYear() + 1}-03-31`;
        const [fy] = await FinancialYear.findOrCreate({
          where: { name: fyName },
          defaults: { name: fyName, start_date: fyStart, end_date: fyEnd, is_active: true },
        });
        if (fy) await FinancialYear.update({ is_active: true }, { where: { id: fy.id } });
        console.log(`✅ Seeded financial year ${fyName}.`);
      } catch (_) { console.log('⚠️ Accounts seed skipped (may already exist).'); }

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

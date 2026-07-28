require('dotenv').config({ path: require('path').join(__dirname, '.env.development') });
const { Client } = require('pg');
const erpSeq = new Client({ host: process.env.ERP_DB_HOST, port: parseInt(process.env.ERP_DB_PORT), user: process.env.ERP_DB_USER, password: process.env.ERP_DB_PASSWORD, database: process.env.ERP_DB_NAME });

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
  `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS created_by VARCHAR(100)`,
  `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100)`,
  `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100)`,
  `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP`,
  `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS authorized_by VARCHAR(100)`,
  `ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS authorized_date TIMESTAMP`,
  `ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS node_type VARCHAR(20) NOT NULL DEFAULT 'SKU'`,
  `ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS parent_id INTEGER`,
  `ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS color VARCHAR(50)`,
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
  `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) NOT NULL DEFAULT 'Job Order'`,
  `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS party_id INTEGER`,
  `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS party_name VARCHAR(200)`,
  `ALTER TABLE IF EXISTS t_subcontract_receipt_item ADD COLUMN IF NOT EXISTS accepted_qty DECIMAL(12,2)`,
  `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS hs_code VARCHAR(50)`,
  `ALTER TABLE IF EXISTS t_purchase_order_item ADD COLUMN IF NOT EXISTS pr_no VARCHAR(50)`,
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
  `ALTER TABLE IF EXISTS t_purchase_order ALTER COLUMN po_date TYPE TIMESTAMP USING po_date::TIMESTAMP`,
  `ALTER TABLE IF EXISTS t_purchase_order ADD COLUMN IF NOT EXISTS req_date DATE`,
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
  `ALTER TABLE IF EXISTS m_company_settings ADD COLUMN IF NOT EXISTS logo_url TEXT`,
  `UPDATE m_company_settings SET logo_url = '/logo.png' WHERE logo_url IS NULL OR logo_url = ''`,
  `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS req_date DATE`,
  `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS jo_date DATE`,
  `ALTER TABLE IF EXISTS t_production_order ALTER COLUMN bom_id DROP NOT NULL`,
  `ALTER TABLE IF EXISTS t_production_order ALTER COLUMN product_item_id DROP NOT NULL`,
  `ALTER TABLE IF EXISTS t_production_order ALTER COLUMN product_code DROP NOT NULL`,
  `ALTER TABLE IF EXISTS t_production_order ALTER COLUMN product_name DROP NOT NULL`,
  `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS grn_prefix VARCHAR(10) NOT NULL DEFAULT 'GRR'`,
  `ALTER TABLE IF EXISTS m_stores_settings ADD COLUMN IF NOT EXISTS auto_generate_grn BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS old_jo_no VARCHAR(50)`,
  `ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS jo_year VARCHAR(10)`,
];

async function main() {
  await erpSeq.connect();
  for (const sql of erpMigrations) {
    try {
      await erpSeq.query(sql);
    } catch (e) {
      // Find the position of "NOT" in the SQL
      const notPos = sql.indexOf('NOT');
      const atPos = parseInt(e.message.match(/character\s+(\d+)/)?.[1] || '0');
      console.log('ERROR at char', atPos, ':', e.message.slice(0, 120));
      console.log('  SQL region:', JSON.stringify(sql.slice(Math.max(0, atPos - 10), atPos + 20)));
      console.log('  Full SQL:', sql.slice(0, 100) + '...');
    }
  }
  await erpSeq.end();
  process.exit(0);
}
main().catch(console.error);

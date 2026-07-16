-- ERP safe migrations (idempotent). Run against hrdb and erpdb on every deploy.
-- Only ADD COLUMN IF NOT EXISTS statements here so re-running is always safe.
-- One-time destructive steps (REBUILD_ITEM_MASTER drops, t_grn RENAME) are handled
-- by the backend boot migration (backend/index.js erpMigrations) and intentionally
-- omitted from this file.

-- ─────────────── m_item_master: reconcile to current model schema ───────────────
-- The restored demo DB has the legacy item-master schema (category_id, no group
-- hierarchy). Safe sync never alters existing tables, so we add every model column
-- here. Order does not matter; all are IF NOT EXISTS.
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS group_id INTEGER;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS subgroup_id INTEGER;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS type_id INTEGER;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS subtype_id INTEGER;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS min_order_qty DECIMAL(12,2) DEFAULT 0;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS reorder_qty DECIMAL(12,2) DEFAULT 0;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS lead_time_days INTEGER;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS default_location VARCHAR(100);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS abc_class VARCHAR(1);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS valuation_method VARCHAR(20) DEFAULT 'Moving Average';
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS standard_cost DECIMAL(14,2) DEFAULT 0;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS last_purchase_cost DECIMAL(14,2) DEFAULT 0;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS moving_average_cost DECIMAL(14,2) DEFAULT 0;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS mrp DECIMAL(14,2) DEFAULT 0;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS track_serial BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS track_batch BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS barcode_type VARCHAR(20);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS attributes JSON;

-- Item master audit columns (fixes "Failed to load items")
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP;
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS authorized_by VARCHAR(100);
ALTER TABLE IF EXISTS m_item_master ADD COLUMN IF NOT EXISTS authorized_date TIMESTAMP;

-- ─────────────── BOM costing columns ───────────────
ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS labour_cost DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS overhead_cost DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS overhead_is_percent BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS margin_percent DECIMAL(5,2) NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS selling_price DECIMAL(14,2) NOT NULL DEFAULT 0;
ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS product_id INTEGER;

-- ─────────────── BOM items ───────────────
ALTER TABLE IF EXISTS t_bom_item ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(14,2);
ALTER TABLE IF EXISTS t_bom_item ADD COLUMN IF NOT EXISTS operation VARCHAR(100);

-- ─────────────── Product master ───────────────
ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS item_id INTEGER;
ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS category_id INTEGER;
ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS node_type VARCHAR(20) NOT NULL DEFAULT 'SKU';
ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS parent_id INTEGER;
ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- ─────────────── Inward Register (t_ir) ───────────────
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS cost_posted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) NOT NULL DEFAULT 'Pending';
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS approved_date DATE;
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS approval_remarks TEXT;
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS qa_status VARCHAR(20) NOT NULL DEFAULT 'Pending';
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS qa_by VARCHAR(100);
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS qa_date DATE;
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS qa_remarks TEXT;
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS bill_no VARCHAR(20);
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS bill_date DATE;
ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS ir_type VARCHAR(20) NOT NULL DEFAULT 'GRR';

-- ─────────────── Invoice ───────────────
ALTER TABLE IF EXISTS t_invoice ADD COLUMN IF NOT EXISTS paid_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid';

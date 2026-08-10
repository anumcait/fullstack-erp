-- Extended Stores Settings Migration
-- Run once: psql -d erp_db -f this_file.sql

-- Document prefixes (nullable: NULL/empty = plain sequential numbers)
ALTER TABLE m_stores_settings 
  ADD COLUMN IF NOT EXISTS mr_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS mi_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS grn_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS pr_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS po_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS rfq_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS ir_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS ge_prefix_in VARCHAR(10),
  ADD COLUMN IF NOT EXISTS ge_prefix_out VARCHAR(10),
  ADD COLUMN IF NOT EXISTS bill_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS qc_prefix_iqc VARCHAR(10),
  ADD COLUMN IF NOT EXISTS qc_prefix_ipc VARCHAR(10),
  ADD COLUMN IF NOT EXISTS qc_prefix_fqc VARCHAR(10),
  ADD COLUMN IF NOT EXISTS audit_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS stock_adj_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS transfer_prefix VARCHAR(10),
  ADD COLUMN IF NOT EXISTS dc_prefix_sale_approval VARCHAR(10) DEFAULT 'SA',
  ADD COLUMN IF NOT EXISTS dc_prefix_labour VARCHAR(10) DEFAULT 'DCL',
  ADD COLUMN IF NOT EXISTS dc_prefix_repair VARCHAR(10) DEFAULT 'DCR',
  ADD COLUMN IF NOT EXISTS dc_prefix_maintenance VARCHAR(10) DEFAULT 'DCM',
  ADD COLUMN IF NOT EXISTS dc_prefix_jobwork VARCHAR(10) DEFAULT 'DCJ',
  ADD COLUMN IF NOT EXISTS dc_prefix_nonreturn VARCHAR(10) DEFAULT 'DCN';

-- Document Start Numbers (Zoho-style: numbering starts from this value)
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS mr_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS mi_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS grn_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS pr_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS po_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rfq_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ir_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ge_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS audit_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS bill_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS adj_start_no INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS transfer_start_no INTEGER DEFAULT 1;

-- Auto-Generate Flags
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS auto_generate_pr BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_po BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_rfq BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_dc BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_ir BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_bill BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_qc BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_audit BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_adj BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_generate_transfer BOOLEAN DEFAULT FALSE;

-- Warehouse & Bins
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS enforce_bin_on_receipt BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enforce_bin_on_issue BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allow_multi_warehouse BOOLEAN DEFAULT TRUE;

-- Valuation & Costing
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS standard_cost_update_on_grn BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS decimal_precision_qty INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS decimal_precision_cost INTEGER DEFAULT 4;

-- Change valuation_method to ENUM (PostgreSQL)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'valuation_method_enum') THEN
    CREATE TYPE valuation_method_enum AS ENUM ('FIFO','LIFO','WEIGHTED_AVERAGE','STANDARD');
  END IF;
END $$;

-- Map legacy values to the new enum before casting, then drop/re-add default
UPDATE m_stores_settings
  SET valuation_method = 'WEIGHTED_AVERAGE'
  WHERE valuation_method NOT IN ('FIFO','LIFO','WEIGHTED_AVERAGE','STANDARD');

ALTER TABLE m_stores_settings
  ALTER COLUMN valuation_method DROP DEFAULT;

ALTER TABLE m_stores_settings
  ALTER COLUMN valuation_method TYPE valuation_method_enum USING valuation_method::valuation_method_enum;

ALTER TABLE m_stores_settings
  ALTER COLUMN valuation_method SET DEFAULT 'WEIGHTED_AVERAGE';

-- Batch / Serial
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS enforce_batch_on_receipt BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enforce_batch_on_issue BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enforce_fefo_on_issue BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS expiry_warning_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS serial_tracking_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enforce_serial_on_issue BOOLEAN DEFAULT FALSE;

-- Stock Rules
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS allow_backdated_entries BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS max_backdate_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS reorder_auto_create_pr BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stock_reservation_enabled BOOLEAN DEFAULT FALSE;

-- Approval Workflows
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS grn_requires_qa BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS grn_requires_approval BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS mi_requires_approval BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS dc_requires_approval BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stock_adj_requires_approval BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS stock_adj_approval_limit DECIMAL(14,2) DEFAULT 0;

-- Aging & Analysis
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS aging_bucket_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS slow_moving_months INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS dead_stock_days INTEGER DEFAULT 90;

-- Item Defaults
ALTER TABLE m_stores_settings
  ADD COLUMN IF NOT EXISTS default_min_stock DECIMAL(14,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_reorder_level DECIMAL(14,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_max_stock DECIMAL(14,3) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_uom_id INTEGER;
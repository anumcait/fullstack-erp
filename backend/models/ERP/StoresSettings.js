const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StoresSettings = sequelize.define(
    'StoresSettings',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },

      // Document prefixes (nullable — leave blank/null for plain sequential numbers)
      mr_prefix: { type: DataTypes.STRING(10), allowNull: true },
      mi_prefix: { type: DataTypes.STRING(10), allowNull: true },
      grn_prefix: { type: DataTypes.STRING(10), allowNull: true },
      pr_prefix: { type: DataTypes.STRING(10), allowNull: true },
      po_prefix: { type: DataTypes.STRING(10), allowNull: true },
      rfq_prefix: { type: DataTypes.STRING(10), allowNull: true },
      ir_prefix: { type: DataTypes.STRING(10), allowNull: true },
      ge_prefix_in: { type: DataTypes.STRING(10), allowNull: true },
      ge_prefix_out: { type: DataTypes.STRING(10), allowNull: true },
      bill_prefix: { type: DataTypes.STRING(10), allowNull: true },
      voucher_prefix: { type: DataTypes.STRING(10), allowNull: true },
      qc_prefix_iqc: { type: DataTypes.STRING(10), allowNull: true },
      qc_prefix_ipc: { type: DataTypes.STRING(10), allowNull: true },
      qc_prefix_fqc: { type: DataTypes.STRING(10), allowNull: true },
      audit_prefix: { type: DataTypes.STRING(10), allowNull: true },
      stock_adj_prefix: { type: DataTypes.STRING(10), allowNull: true },
      transfer_prefix: { type: DataTypes.STRING(10), allowNull: true },

      // Delivery Challan prefixes
      dc_prefix_sale_approval: { type: DataTypes.STRING(10), defaultValue: 'SA' },
      dc_prefix_labour: { type: DataTypes.STRING(10), defaultValue: 'DCL' },
      dc_prefix_repair: { type: DataTypes.STRING(10), defaultValue: 'DCR' },
      dc_prefix_maintenance: { type: DataTypes.STRING(10), defaultValue: 'DCM' },
      dc_prefix_jobwork: { type: DataTypes.STRING(10), defaultValue: 'DCJ' },
      dc_prefix_nonreturn: { type: DataTypes.STRING(10), defaultValue: 'DCN' },

      // Auto-Generate Flags
      auto_generate_mr: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_mi: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_grn: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_pr: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_po: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_rfq: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_dc: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_ir: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_bill: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_voucher: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_qc: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_audit: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_adj: { type: DataTypes.BOOLEAN, defaultValue: false },
      auto_generate_transfer: { type: DataTypes.BOOLEAN, defaultValue: false },

      // Document Start Numbers (plain sequential numbering starts here)
      mr_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      mi_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      grn_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      pr_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      po_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      rfq_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      ir_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      ge_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      audit_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      bill_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      voucher_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      adj_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },
      transfer_start_no: { type: DataTypes.INTEGER, defaultValue: 1 },

      // Warehouse & Location
      default_warehouse: { type: DataTypes.STRING(100), defaultValue: 'Main Store' },
      bin_location_required: { type: DataTypes.BOOLEAN, defaultValue: true },
      enforce_bin_on_receipt: { type: DataTypes.BOOLEAN, defaultValue: false },
      enforce_bin_on_issue: { type: DataTypes.BOOLEAN, defaultValue: false },
      allow_multi_warehouse: { type: DataTypes.BOOLEAN, defaultValue: true },

      // Valuation & Costing
      valuation_method: { type: DataTypes.ENUM('FIFO', 'LIFO', 'WEIGHTED_AVERAGE', 'STANDARD'), defaultValue: 'WEIGHTED_AVERAGE' },
      standard_cost_update_on_grn: { type: DataTypes.BOOLEAN, defaultValue: false },
      decimal_precision_qty: { type: DataTypes.INTEGER, defaultValue: 3 },
      decimal_precision_cost: { type: DataTypes.INTEGER, defaultValue: 4 },

      // Batch / Serial
      batch_tracking_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      enforce_batch_on_receipt: { type: DataTypes.BOOLEAN, defaultValue: false },
      enforce_batch_on_issue: { type: DataTypes.BOOLEAN, defaultValue: false },
      enforce_fefo_on_issue: { type: DataTypes.BOOLEAN, defaultValue: false },
      expiry_warning_days: { type: DataTypes.INTEGER, defaultValue: 30 },
      serial_tracking_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
      enforce_serial_on_issue: { type: DataTypes.BOOLEAN, defaultValue: false },

      // Stock Rules
      negative_stock_allowed: { type: DataTypes.BOOLEAN, defaultValue: false },
      allow_backdated_entries: { type: DataTypes.BOOLEAN, defaultValue: false },
      max_backdate_days: { type: DataTypes.INTEGER, defaultValue: 30 },
      low_stock_alert: { type: DataTypes.BOOLEAN, defaultValue: true },
      reorder_auto_create_pr: { type: DataTypes.BOOLEAN, defaultValue: false },
      stock_reservation_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },

      // Approval Workflows
      grn_requires_qa: { type: DataTypes.BOOLEAN, defaultValue: false },
      grn_requires_approval: { type: DataTypes.BOOLEAN, defaultValue: true },
      mi_requires_approval: { type: DataTypes.BOOLEAN, defaultValue: false },
      dc_requires_approval: { type: DataTypes.BOOLEAN, defaultValue: false },
      stock_adj_requires_approval: { type: DataTypes.BOOLEAN, defaultValue: true },
      stock_adj_approval_limit: { type: DataTypes.DECIMAL(14, 2), defaultValue: 0 },

      // Aging & Analysis
      aging_bucket_days: { type: DataTypes.INTEGER, defaultValue: 30 },
      slow_moving_months: { type: DataTypes.INTEGER, defaultValue: 3 },
      dead_stock_days: { type: DataTypes.INTEGER, defaultValue: 90 },

      // Defaults for New Items
      default_min_stock: { type: DataTypes.DECIMAL(14, 3), defaultValue: 0 },
      default_reorder_level: { type: DataTypes.DECIMAL(14, 3), defaultValue: 0 },
      default_max_stock: { type: DataTypes.DECIMAL(14, 3), defaultValue: 0 },
      default_uom_id: { type: DataTypes.INTEGER },

      created_date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: 'm_stores_settings',
      timestamps: false,
      underscored: true,
    }
  );
  return StoresSettings;
};
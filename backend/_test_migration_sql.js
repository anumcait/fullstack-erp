const { sequelize } = require('./models/ERP');

const sqls = [
  'ALTER TABLE IF EXISTS t_bom ADD COLUMN IF NOT EXISTS labour_cost DECIMAL(14,2) NOT NULL DEFAULT 0',
  'ALTER TABLE IF EXISTS t_invoice ADD COLUMN IF NOT EXISTS paid_status VARCHAR(20) NOT NULL DEFAULT \'Unpaid\'',
  'ALTER TABLE IF EXISTS t_stock_audit_item ALTER COLUMN item_id DROP NOT NULL',
  'ALTER TABLE IF EXISTS t_production_order ADD COLUMN IF NOT EXISTS order_type VARCHAR(20) NOT NULL DEFAULT \'Job Order\'',
  'ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS cost_posted BOOLEAN NOT NULL DEFAULT FALSE',
  'ALTER TABLE IF EXISTS m_product_master ADD COLUMN IF NOT EXISTS node_type VARCHAR(20) NOT NULL DEFAULT \'SKU\'',
  'ALTER TABLE IF EXISTS t_ir ADD COLUMN IF NOT EXISTS ir_type VARCHAR(20) NOT NULL DEFAULT \'GRR\'',
];

(async () => {
  for (const sql of sqls) {
    const pos = sql.indexOf('NOT');
    const at41 = sql.slice(40, 43);
    console.log('SQL:', sql.slice(0, 60) + '...');
    console.log('  chars 40-42:', JSON.stringify(at41), '| first NOT at:', pos);
    try {
      await sequelize.query(sql);
      console.log('  OK');
    } catch(e) {
      console.log('  ERROR:', e.message.split('\n')[0].slice(0, 150));
    }
  }
  process.exit(0);
})();

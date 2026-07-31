const { Op } = require('sequelize');
const db = require('../../models/ERP');

const round2 = (v) => Number(Number(v || 0).toFixed(2));

function getFinancialYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

async function generateBillNo() {
  const finYear = getFinancialYear();
  const seq = db.sequelize;
  return await seq.transaction(async (t) => {
    await seq.query(
      `INSERT INTO t_sequence_counters (prefix, financial_year, last_number) VALUES ('BILL', :finYear, 0) ON CONFLICT DO NOTHING`,
      { replacements: { finYear }, transaction: t }
    );
    const [rows] = await seq.query(
      `UPDATE t_sequence_counters SET last_number = last_number + 1 WHERE prefix = 'BILL' AND financial_year = :finYear RETURNING last_number`,
      { replacements: { finYear }, transaction: t }
    );
    const num = rows[0].last_number;
    const shortFinYear = finYear.slice(2, 4) + finYear.slice(7, 9);
    return { full: `${shortFinYear}/${String(num).padStart(4, '0')}`, display: String(num) };
  });
}

const recalc = (items) => {
  let subtotal = 0, totalCgst = 0, totalSgst = 0, totalIgst = 0, grand = 0;
  const computed = items.map((it) => {
    const qty = parseFloat(it.quantity) || 0;
    const rate = parseFloat(it.rate) || 0;
    const disc = parseFloat(it.discount_percent) || 0;
    const taxable = round2(qty * rate * (1 - disc / 100));
    const cgst = round2(taxable * (parseFloat(it.cgst_rate) || 0) / 100);
    const sgst = round2(taxable * (parseFloat(it.sgst_rate) || 0) / 100);
    const igst = round2(taxable * (parseFloat(it.igst_rate) || 0) / 100);
    const amount = round2(taxable + cgst + sgst + igst);
    subtotal += taxable; totalCgst += cgst; totalSgst += sgst; totalIgst += igst; grand += amount;
    return { ...it, taxable_amount: taxable, cgst, sgst, igst, amount };
  });
  return {
    items: computed,
    subtotal: round2(subtotal),
    total_cgst: round2(totalCgst),
    total_sgst: round2(totalSgst),
    total_igst: round2(totalIgst),
    grand_total: round2(grand),
  };
};

const linkGRRs = async (invoiceNo, grrIds) => {
  if (!Array.isArray(grrIds) || grrIds.length === 0) return;
  const today = new Date().toISOString().split('T')[0];
  await db.GRN.update({ bill_no: invoiceNo, bill_date: today }, { where: { id: { [Op.in]: grrIds } } });
};

// ── Costing: derive item cost from the billed (GRR) invoice rate ──
const postCosting = async (invoice) => {
  const inv = await db.Invoice.findByPk(invoice.id, {
    include: [{ model: db.InvoiceItem, as: 'items' }],
  });
  if (!inv) return;
  for (const it of inv.items) {
    if (!it.item_id) continue;
    const item = await db.ItemMaster.findByPk(it.item_id);
    if (!item) continue;
    const qty = parseFloat(it.quantity) || 0;
    const rate = parseFloat(it.rate) || 0;
    const current = parseFloat(item.current_stock) || 0;
    const avg = parseFloat(item.moving_average_cost) || 0;
    const denom = current + qty;
    const newAvg = denom > 0 ? (current * avg + qty * rate) / denom : rate;
    await item.update({
      last_purchase_cost: rate,
      moving_average_cost: Number(newAvg.toFixed(2)),
    });
  }
};

async function peekNextBillNo() {
  const finYear = getFinancialYear();
  const seq = db.sequelize;
  const [rows] = await seq.query(
    `SELECT last_number FROM t_sequence_counters WHERE prefix = 'BILL' AND financial_year = :finYear`,
    { replacements: { finYear } }
  );
  let num = 0;
  if (rows.length > 0) {
    num = rows[0].last_number || 0;
  }
  const shortFinYear = finYear.slice(2, 4) + finYear.slice(7, 9);
  return { full: `${shortFinYear}/${String(num + 1).padStart(4, '0')}`, display: String(num + 1) };
}

exports.getNextBillNo = async (req, res) => {
  try {
    const billNo = await peekNextBillNo();
    res.json(billNo);
  } catch (err) {
    console.error('Error peeking next bill no:', err);
    res.status(500).json({ error: 'Failed to get next bill number' });
  }
};

exports.getList = async (req, res) => {
  try {
    const { search, status } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) where[Op.or] = [{ invoice_no: { [Op.iLike]: `%${search}%` } }, { party_name: { [Op.iLike]: `%${search}%` } }];
    const rows = await db.Invoice.findAll({ where, order: [['invoice_date', 'DESC']] });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const inv = await db.Invoice.findByPk(req.params.id, {
      include: [{ model: db.InvoiceItem, as: 'items' }],
    });
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    res.json(inv);
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

const buildInvoice = async (body) => {
  const items = Array.isArray(body.items) ? body.items : [];
  const { items: computed, subtotal, total_cgst, total_sgst, total_igst, grand_total } = recalc(items);
  const billNo = await generateBillNo();
  const inv = await db.Invoice.create({
    invoice_no: billNo.full,
    invoice_date: body.bill_date || body.invoice_date,
    party_id: body.party_id || null,
    party_name: body.party_name || null,
    party_gstin: body.party_gstin || null,
    address: body.address || null,
    place_of_supply: body.place_of_supply || null,
    dc_id: body.dc_id || null,
    dc_no: body.dc_no || null,
    subtotal,
    total_cgst,
    total_sgst,
    total_igst,
    grand_total,
    remarks: body.remarks || null,
    status: 'Draft',
  });
  for (const it of computed) {
    await db.InvoiceItem.create({
      invoice_id: inv.id,
      item_id: it.item_id || null,
      item_code: it.item_code || null,
      item_name: it.item_name,
      hsn_code: it.hsn_code || null,
      quantity: it.quantity || 0,
      unit_id: it.unit_id || null,
      rate: it.rate || 0,
      discount_percent: it.discount_percent || 0,
      taxable_amount: it.taxable_amount,
      cgst_rate: it.cgst_rate || 0,
      sgst_rate: it.sgst_rate || 0,
      igst_rate: it.igst_rate || 0,
      cgst: it.cgst,
      sgst: it.sgst,
      igst: it.igst,
      amount: it.amount,
    });
  }
  return inv;
};

exports.create = async (req, res) => {
  try {
    const inv = await buildInvoice(req.body);
    await linkGRRs(inv.invoice_no, req.body.grr_ids);
    await postCosting(inv);
    res.status(201).json(inv);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

exports.update = async (req, res) => {
  try {
    const inv = await db.Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    if (inv.status !== 'Draft') return res.status(400).json({ error: 'Only draft invoices can be edited' });
    await db.InvoiceItem.destroy({ where: { invoice_id: inv.id } });
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const { items: computed, subtotal, total_cgst, total_sgst, total_igst, grand_total } = recalc(items);
    await inv.update({
      invoice_date: req.body.invoice_date,
      party_id: req.body.party_id || null,
      party_name: req.body.party_name || null,
      party_gstin: req.body.party_gstin || null,
      address: req.body.address || null,
      place_of_supply: req.body.place_of_supply || null,
      dc_id: req.body.dc_id || null,
      dc_no: req.body.dc_no || null,
      subtotal, total_cgst, total_sgst, total_igst, grand_total,
      remarks: req.body.remarks || null,
    });
    for (const it of computed) {
      await db.InvoiceItem.create({
        invoice_id: inv.id,
        item_id: it.item_id || null,
        item_code: it.item_code || null,
        item_name: it.item_name,
        hsn_code: it.hsn_code || null,
        quantity: it.quantity || 0,
        unit_id: it.unit_id || null,
        rate: it.rate || 0,
        discount_percent: it.discount_percent || 0,
        taxable_amount: it.taxable_amount,
        cgst_rate: it.cgst_rate || 0,
        sgst_rate: it.sgst_rate || 0,
        igst_rate: it.igst_rate || 0,
        cgst: it.cgst,
        sgst: it.sgst,
        igst: it.igst,
        amount: it.amount,
      });
    }
    await linkGRRs(inv.invoice_no, req.body.grr_ids);
    await postCosting(inv);
    res.json(inv);
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

exports.markBilled = async (req, res) => {
  try {
    const inv = await db.Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    if (inv.status !== 'Draft') return res.status(400).json({ error: 'Invoice already billed' });
    inv.status = 'Billed';
    await inv.save();
    res.json(inv);
  } catch (err) {
    console.error('Error billing invoice:', err);
    res.status(500).json({ error: 'Failed to bill invoice' });
  }
};

exports.remove = async (req, res) => {
  try {
    const inv = await db.Invoice.findByPk(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    if (inv.status === 'Billed') return res.status(400).json({ error: 'Cannot delete a billed invoice' });
    await db.InvoiceItem.destroy({ where: { invoice_id: inv.id } });
    await inv.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

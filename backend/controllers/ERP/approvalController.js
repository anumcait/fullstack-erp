const db = require('../../models/ERP');
const { Op } = require('sequelize');

const MaterialRequisition = db.MaterialRequisition;
const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseOrder = db.PurchaseOrder;
const StockAudit = db.StockAudit;
const GRN = db.GRN;
const SupplierMaster = db.SupplierMaster;

// Normalise the different approval entities into a single shape the
// Approvals inbox can render and act on uniformly.
async function buildApprovalList() {
  const out = [];

  // ── Material Requisitions (status Pending) ──
  const mrs = await MaterialRequisition.findAll({
    where: { status: 'Pending' },
    order: [['created_date', 'ASC']],
  });
  for (const r of mrs) {
    out.push({
      type: 'MR', typeLabel: 'Material Requisition', id: r.id,
      docNo: r.req_no, date: r.req_date, party: r.requested_by || '',
      department: r.department || '', amount: null, status: r.status,
      approveEndpoint: `/api/erp/stores/material-requisitions/${r.id}/approve`,
      viewPath: `/stores/material-requisitions/view/${r.id}`,
    });
  }

  // ── Purchase Requisitions (Indents) (status Pending) ──
  const prs = await PurchaseRequisition.findAll({
    where: { status: 'Pending' },
    include: [{ model: db.PurchaseRequisitionItem, as: 'items' }],
    order: [['created_date', 'ASC']],
  });
  for (const r of prs) {
    const amount = (r.items || []).reduce((s, it) => s + Number(it.est_cost || 0), 0);
    out.push({
      type: 'PR', typeLabel: 'Purchase Requisition', id: r.id,
      docNo: r.req_no, date: r.req_date, party: r.requested_by || '',
      department: r.department || '', amount, status: r.status,
      approveEndpoint: `/api/erp/purchase/requisitions/${r.id}/approve`,
      viewPath: `/purchase/requisitions/view/${r.id}`,
    });
  }

  // ── Purchase Orders (Draft / Pending) ──
  const pos = await PurchaseOrder.findAll({
    where: { status: { [Op.in]: ['Draft', 'Pending'] } },
    include: [{ model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_name'] }],
    order: [['created_date', 'ASC']],
  });
  for (const r of pos) {
    out.push({
      type: 'PO', typeLabel: 'Purchase Order', id: r.id,
      docNo: r.po_no, date: r.po_date, party: r.supplier ? r.supplier.supplier_name : '',
      department: '', amount: Number(r.grand_total || 0), status: r.status,
      approveEndpoint: `/api/erp/purchase/orders/${r.id}/approve`,
      viewPath: `/purchase/orders/view/${r.id}`,
    });
  }

  // ── Stock Audits (Pending) ──
  const audits = await StockAudit.findAll({
    where: { status: 'Pending' },
    order: [['created_date', 'ASC']],
  });
  for (const r of audits) {
    out.push({
      type: 'AUDIT', typeLabel: 'Stock Audit', id: r.id,
      docNo: r.audit_no, date: r.audit_date, party: r.auditor || '',
      department: r.location || '', amount: null, status: r.status,
      approveEndpoint: `/api/erp/stores/stock-audit/${r.id}/approve`,
      viewPath: `/stores/stock-audit/view/${r.id}`,
    });
  }

  // ── Goods Receipt Notes awaiting QA / approval ──
  const grns = await GRN.findAll({
    where: { approval_status: { [Op.in]: ['Pending', 'Partial'] } },
    include: [{ model: SupplierMaster, as: 'supplier', attributes: ['id', 'supplier_name'] }],
    order: [['created_date', 'ASC']],
  });
  for (const r of grns) {
    out.push({
      type: 'GRN', typeLabel: 'Goods Receipt', id: r.id,
      docNo: r.ir_no, date: r.ir_date, party: r.supplier ? r.supplier.supplier_name : '',
      department: '', amount: null, status: r.approval_status,
      approveEndpoint: `/api/erp/stores/grn/${r.id}/approve`,
      viewPath: `/stores/grr/view/${r.id}`,
    });
  }

  return out;
}

exports.getPendingApprovals = async (req, res) => {
  try {
    const items = await buildApprovalList();
    const byType = items.reduce((acc, it) => {
      acc[it.type] = (acc[it.type] || 0) + 1;
      return acc;
    }, {});
    res.json({ total: items.length, byType, items });
  } catch (err) {
    console.error('getPendingApprovals', err);
    res.status(500).json({ error: 'Failed to load approvals' });
  }
};

exports.getStoresApprovals = async (req, res) => {
  try {
    const items = await buildApprovalList();
    const storesTypes = ['MR', 'AUDIT', 'GRN'];
    const filtered = items.filter((it) => storesTypes.includes(it.type));
    const byType = filtered.reduce((acc, it) => {
      acc[it.type] = (acc[it.type] || 0) + 1;
      return acc;
    }, {});
    res.json({ total: filtered.length, byType, items: filtered });
  } catch (err) {
    console.error('getStoresApprovals', err);
    res.status(500).json({ error: 'Failed to load stores approvals' });
  }
};

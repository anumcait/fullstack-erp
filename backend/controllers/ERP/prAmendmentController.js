const db = require('../../models/ERP');

const PRAmendment = db.PRAmendment;
const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseRequisitionItem = db.PurchaseRequisitionItem;

function sanitize(obj) {
  if (!obj) return null;
  const { id, created_date, updated_at, requisition_id, ...rest } = obj;
  return rest;
}

exports.createAmendment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amended_by, change_summary, changed_fields } = req.body;

    const pr = await PurchaseRequisition.findByPk(id, {
      include: [{ model: PurchaseRequisitionItem, as: 'items' }],
    });
    if (!pr) return res.status(404).json({ error: 'PR not found' });

    const oldValue = {
      header: sanitize(pr.toJSON()),
      items: (pr.items || []).map((i) => sanitize(i.toJSON())),
    };

    const newValue = changed_fields
      ? { header: { ...oldValue.header, ...changed_fields.header }, items: changed_fields.items || oldValue.items }
      : oldValue;

    await PRAmendment.create({
      requisition_id: id,
      amended_by: amended_by || req.session?.user?.name || 'System',
      amendment_date: new Date(),
      change_summary: change_summary || 'Manual amendment',
      old_value: oldValue,
      new_value: newValue,
    });

    res.json({ message: 'Amendment recorded' });
  } catch (err) {
    console.error('Error creating PR amendment:', err);
    res.status(500).json({ error: 'Failed to create amendment' });
  }
};

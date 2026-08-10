const db = require('../../models/ERP');
const { Op } = require('sequelize');
const { generateDocNumber, nextDocNumber } = require('../../utils/docNumber');
const { postMovement, reverseMovements, getDefaultWarehouse, lockStock, negativeStockAllowed, REF_TYPES, getStoresSettings } = require('../../utils/stockService');

const sequelize = db.sequelize;
const MaterialIssue = db.MaterialIssue;
const MaterialIssueItem = db.MaterialIssueItem;
const MaterialRequisition = db.MaterialRequisition;
const MaterialRequisitionItem = db.MaterialRequisitionItem;
const ItemMaster = db.ItemMaster;
const PurchaseRequisition = db.PurchaseRequisition;
const PurchaseRequisitionItem = db.PurchaseRequisitionItem;

exports.getNextNumber = async (req, res) => {
  try {
    const settings = await getStoresSettings();
    const issue_no = await nextDocNumber(MaterialIssue, 'issue_no', Number(settings?.mi_start_no) || 1, settings?.mi_prefix);
    res.json({ issue_no, sequence: issue_no });
  } catch (err) {
    console.error('Error getting next issue number:', err);
    res.status(500).json({ error: 'Failed to get next issue number' });
  }
};

exports.getList = async (req, res) => {
  try {
    const { search, status, issue_type } = req.query;
    const where = {};
    if (status) where.status = status;
    if (issue_type) where.issue_type = issue_type;
    if (search) {
      where[Op.or] = [
        { issue_no: { [Op.iLike]: `%${search}%` } },
        { issued_to: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const data = await MaterialIssue.findAll({
      where,
      include: [
        { model: MaterialIssueItem, as: 'items' },
        { model: MaterialRequisition, as: 'requisition', attributes: ['id', 'req_no'] },
      ],
      order: [['created_date', 'DESC']],
    });
    res.json(data);
  } catch (err) {
    console.error('Error fetching material issues:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await MaterialIssue.findByPk(req.params.id, {
      include: [
        { model: MaterialIssueItem, as: 'items' },
        { model: MaterialRequisition, as: 'requisition' },
      ],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { items, ...header } = req.body;
    header.issue_type = header.issue_type || 'General';
    if (!header.issue_no) {
      const settings = await getStoresSettings();
      header.issue_no = await nextDocNumber(MaterialIssue, 'issue_no', Number(settings?.mi_start_no) || 1, settings?.mi_prefix);
    }
    const doc = await MaterialIssue.create(header, { transaction: t });
    if (items && items.length > 0) {
      const rows = items.map((it) => ({ ...it, issue_id: doc.id }));
      await MaterialIssueItem.bulkCreate(rows, { transaction: t });

      const wh = await getDefaultWarehouse();
      const negAllowed = await negativeStockAllowed();
      // Update MR item issued quantities and post stock outward atomically
      for (const it of items) {
        if (it.req_item_id) {
          const mrItem = await MaterialRequisitionItem.findByPk(it.req_item_id, { transaction: t });
          if (mrItem) {
            const newIssued = parseFloat(mrItem.issued_quantity || 0) + parseFloat(it.quantity);
            const newPending = Math.max(0, parseFloat(mrItem.quantity) - newIssued);
            await mrItem.update({ issued_quantity: newIssued, pending_quantity: newPending }, { transaction: t });
          }
        }
        if (it.item_id) {
          const qty = Number(it.quantity || 0);
          if (qty > 0 && !negAllowed) {
            const locked = await lockStock(it.item_id, t);
            if (Number(locked?.current_stock || 0) < qty) {
              throw new Error(`Insufficient stock for ${it.item_code || it.item_name || it.item_id}`);
            }
          }
          const item = await ItemMaster.findByPk(it.item_id, { transaction: t });
          if (item) {
            await postMovement(
              {
                item_id: it.item_id,
                warehouse_id: it.warehouse_id || wh?.id || null,
                batch_id: it.batch_id || null,
                ledger_date: doc.issue_date || new Date(),
                ref_type: REF_TYPES.MATERIAL_ISSUE,
                doc_no: doc.issue_no,
                ref_no: doc.issue_no,
                qty_in: 0,
                qty_out: qty,
                unit_cost: Number(item.moving_average_cost || 0),
                remarks: it.remarks || `Issued to ${header.issued_to || ''}`.trim(),
                user: req.session?.user?.name || 'System',
              },
              t
            );
          }
        }
      }
    }

    // Update MR header status
    if (header.req_id) {
      const mr = await MaterialRequisition.findByPk(header.req_id, {
        include: [{ model: MaterialRequisitionItem, as: 'items' }],
        transaction: t,
      });
      if (mr) {
        const allIssued = mr.items.every((i) => parseFloat(i.pending_quantity || 0) <= 0);
        const anyIssued = mr.items.some((i) => parseFloat(i.issued_quantity || 0) > 0);
        if (allIssued) await mr.update({ status: 'Issued' }, { transaction: t });
        else if (anyIssued) await mr.update({ status: 'Partially Issued' }, { transaction: t });
      }
    }

    await t.commit();
    const result = await MaterialIssue.findByPk(doc.id, {
      include: [{ model: MaterialIssueItem, as: 'items' }],
    });
    res.status(201).json(result);
  } catch (err) {
    await t.rollback();
    console.error('Error creating material issue:', err);
    res.status(500).json({ error: err.message || 'Failed to create' });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doc = await MaterialIssue.findByPk(req.params.id, { transaction: t });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.status !== 'Draft') return res.status(400).json({ error: 'Only draft issues can be edited' });

    let { items, ...header } = req.body;
    await doc.update(header, { transaction: t });

    if (items) {
      const oldItems = await MaterialIssueItem.findAll({ where: { issue_id: doc.id }, transaction: t });

      // Reverse previously posted stock for this issue number
      const itemIds = [...new Set(oldItems.map((x) => x.item_id).filter(Boolean))];
      for (const itemId of itemIds) {
        await reverseMovements(
          { item_id: itemId, ref_type: REF_TYPES.MATERIAL_ISSUE, ref_no: doc.issue_no, user: req.session?.user?.name || 'System' },
          t
        );
      }

      for (const it of oldItems) {
        if (it.req_item_id) {
          const mrItem = await MaterialRequisitionItem.findByPk(it.req_item_id, { transaction: t });
          if (mrItem) {
            const newIssued = Math.max(0, parseFloat(mrItem.issued_quantity || 0) - parseFloat(it.quantity || 0));
            const newPending = parseFloat(mrItem.quantity) - newIssued;
            await mrItem.update({ issued_quantity: newIssued, pending_quantity: Math.max(0, newPending) }, { transaction: t });
          }
        }
      }

      await MaterialIssueItem.destroy({ where: { issue_id: doc.id }, transaction: t });

      // Apply new stock adjustments
      const rows = items.map((it) => ({ ...it, issue_id: doc.id }));
      await MaterialIssueItem.bulkCreate(rows, { transaction: t });

      const wh = await getDefaultWarehouse();
      const negAllowed = await negativeStockAllowed();
      for (const it of items) {
        if (it.item_id) {
          const qty = Number(it.quantity || 0);
          if (qty > 0 && !negAllowed) {
            const locked = await lockStock(it.item_id, t);
            if (Number(locked?.current_stock || 0) < qty) {
              throw new Error(`Insufficient stock for ${it.item_code || it.item_name || it.item_id}`);
            }
          }
          const item = await ItemMaster.findByPk(it.item_id, { transaction: t });
          if (item) {
            await postMovement(
              {
                item_id: it.item_id,
                warehouse_id: it.warehouse_id || wh?.id || null,
                batch_id: it.batch_id || null,
                ledger_date: doc.issue_date || new Date(),
                ref_type: REF_TYPES.MATERIAL_ISSUE,
                doc_no: doc.issue_no,
                ref_no: doc.issue_no,
                qty_in: 0,
                qty_out: qty,
                unit_cost: Number(item.moving_average_cost || 0),
                remarks: it.remarks || `Issued to ${header.issued_to || ''}`.trim(),
                user: req.session?.user?.name || 'System',
              },
              t
            );
          }
        }
        if (it.req_item_id) {
          const mrItem = await MaterialRequisitionItem.findByPk(it.req_item_id, { transaction: t });
          if (mrItem) {
            const newIssued = parseFloat(mrItem.issued_quantity || 0) + parseFloat(it.quantity || 0);
            const newPending = Math.max(0, parseFloat(mrItem.quantity) - newIssued);
            await mrItem.update({ issued_quantity: newIssued, pending_quantity: newPending }, { transaction: t });
          }
        }
      }
    }

    await t.commit();
    const result = await MaterialIssue.findByPk(doc.id, {
      include: [{ model: MaterialIssueItem, as: 'items' }],
    });
    res.json(result);
  } catch (err) {
    await t.rollback();
    console.error('Error updating material issue:', err);
    res.status(500).json({ error: err.message || 'Failed to update' });
  }
};

exports.convertToPR = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doc = await MaterialIssue.findByPk(req.params.id, {
      include: [{ model: MaterialIssueItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const issueItems = doc.items || [];
    if (issueItems.length === 0) {
      return res.status(400).json({ error: 'No items in this issue' });
    }

    const itemIds = issueItems.map((it) => it.item_id).filter(Boolean);
    const stockMap = {};
    if (itemIds.length > 0) {
      const stockItems = await ItemMaster.findAll({ where: { id: itemIds } });
      stockItems.forEach((it) => { stockMap[it.id] = Number(it.current_stock || 0); });
    }

    const itemsToPurchase = issueItems.filter((it) => {
      const available = stockMap[it.item_id] || 0;
      const issued = Number(it.quantity || 0);
      return issued > available;
    });

    if (itemsToPurchase.length === 0) {
      return res.status(400).json({ error: 'All items have sufficient stock. No purchase needed.' });
    }

    const settings = await getStoresSettings();
    const prNo = await generateDocNumber('PurchaseRequisition', 'pr_start_no', 'pr_prefix', 'req_no', settings || {});

    const docRef = doc.issue_no || `MI#${doc.id}`;
    const pr = await PurchaseRequisition.create({
      req_no: prNo,
      req_date: new Date(),
      status: 'Pending',
      department: doc.department || null,
      remarks: `Auto-converted from Material Issue #${docRef} (insufficient stock)`,
    }, { transaction: t });

    const prItems = itemsToPurchase.map((it) => {
      const available = stockMap[it.item_id] || 0;
      const issued = Number(it.quantity || 0);
      const toPurchase = issued - available;
      return {
        requisition_id: pr.id,
        item_id: it.item_id,
        item_code: it.item_code,
        item_name: it.item_name,
        quantity: toPurchase,
        unit_id: it.unit_id,
        remarks: `From Issue #${docRef} (stock: ${available}, need: ${toPurchase})`,
      };
    });
    await PurchaseRequisitionItem.bulkCreate(prItems, { transaction: t });

    await t.commit();

    const skippedCount = issueItems.length - itemsToPurchase.length;
    let message = `PR #${prNo} created for ${itemsToPurchase.length} item(s)`;
    if (skippedCount > 0) message += `. ${skippedCount} item(s) had sufficient stock and were skipped.`;

    res.status(201).json({ pr_id: pr.id, pr_no: prNo, message, skippedCount });
  } catch (err) {
    await t.rollback();
    console.error('Error converting issue to PR:', err);
    res.status(500).json({ error: 'Failed to convert to PR' });
  }
};

exports.prPreview = async (req, res) => {
  try {
    const doc = await MaterialIssue.findByPk(req.params.id, {
      include: [{ model: MaterialIssueItem, as: 'items' }],
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    const issueItems = doc.items || [];
    if (issueItems.length === 0) {
      return res.status(400).json({ error: 'No items in this issue' });
    }

    const itemIds = issueItems.map((it) => it.item_id).filter(Boolean);
    const stockMap = {};
    if (itemIds.length > 0) {
      const stockItems = await ItemMaster.findAll({ where: { id: itemIds } });
      stockItems.forEach((it) => { stockMap[it.id] = Number(it.current_stock || 0); });
    }

    const previewItems = issueItems
      .filter((it) => {
        const available = stockMap[it.item_id] || 0;
        const issued = Number(it.quantity || 0);
        return issued > available;
      })
      .map((it) => {
        const available = stockMap[it.item_id] || 0;
        const issued = Number(it.quantity || 0);
        return {
          source_item_id: it.id,
          item_id: it.item_id,
          item_code: it.item_code,
          item_name: it.item_name,
          unit_id: it.unit_id,
          uom: 'NOS',
          requested: issued,
          available: available,
          suggested_qty: issued - available,
          quantity: issued - available,
        };
      });

    res.json({
      doc_no: doc.issue_no,
      doc_date: doc.issue_date,
      doc_department: doc.department,
      items: previewItems,
      allSufficient: previewItems.length === 0,
    });
  } catch (err) {
    console.error('Error preparing issue PR preview:', err);
    res.status(500).json({ error: 'Failed to prepare preview' });
  }
};

exports.createPRFromIssue = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doc = await MaterialIssue.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });

    let { items, remarks } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided for PR' });
    }

    const settings = await getStoresSettings();
    const prNo = await generateDocNumber('PurchaseRequisition', 'pr_start_no', 'pr_prefix', 'req_no', settings || {});

    const docRef = doc.issue_no || `MI#${doc.id}`;
    const pr = await PurchaseRequisition.create({
      req_no: prNo,
      req_date: new Date(),
      status: 'Pending',
      department: doc.department,
      remarks: remarks || `Converted from Material Issue #${docRef}`,
    }, { transaction: t });

    const prItems = items.map((it) => ({
      requisition_id: pr.id,
      item_id: it.item_id,
      item_code: it.item_code,
      item_name: it.item_name,
      quantity: it.quantity,
      unit_id: it.unit_id || null,
      remarks: it.remarks || `From Issue #${docRef}`,
    }));
    await PurchaseRequisitionItem.bulkCreate(prItems, { transaction: t });

    await t.commit();
    res.status(201).json({ pr_id: pr.id, pr_no: prNo, message: `PR #${prNo} created for ${items.length} item(s)` });
  } catch (err) {
    await t.rollback();
    console.error('Error creating PR from issue:', err);
    res.status(500).json({ error: 'Failed to create PR' });
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const doc = await MaterialIssue.findByPk(req.params.id, { transaction: t });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const oldItems = await MaterialIssueItem.findAll({ where: { issue_id: doc.id }, transaction: t });
    const itemIds = [...new Set(oldItems.map((x) => x.item_id).filter(Boolean))];
    for (const itemId of itemIds) {
      await reverseMovements(
        { item_id: itemId, ref_type: REF_TYPES.MATERIAL_ISSUE, ref_no: doc.issue_no, user: req.session?.user?.name || 'System' },
        t
      );
    }
    await MaterialIssueItem.destroy({ where: { issue_id: doc.id }, transaction: t });
    await doc.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Deleted' });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: 'Failed to delete' });
  }
};

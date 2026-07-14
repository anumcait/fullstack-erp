const XLSX = require('xlsx');
const db = require('../../models/ERP');
const { Op } = require('sequelize');

const BOM = db.BOM;
const BOMItem = db.BOMItem;
const ItemMaster = db.ItemMaster;
const Unit = db.Unit;

function genCode(prefix) {
  return new Promise(async (resolve) => {
    const count = await ItemMaster.count({ where: { item_code: { [Op.like]: `${prefix}-%` } } });
    resolve(`${prefix}-${String(count + 1).padStart(4, '0')}`);
  });
}

function detectLotQty(remark) {
  if (!remark) return 1;
  const m = remark.match(/for every\s+(\d+)\s+fans/i);
  return m ? parseInt(m[1], 10) : 1;
}

function normalizeName(name) {
  return (name || '').toString().trim().toLowerCase()
    .replace(/\s*-\s*\d+\s*mm/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeRow(name, qty, remark, color, childrenDefault) {
  let remarkFinal = remark || '';
  let colorFinal = color || '';
  // Some source files place descriptive text (motor make, etc.) in the COLOR column.
  // Move such long values into remarks.
  if (colorFinal && colorFinal.length > 25) {
    remarkFinal = [remarkFinal, colorFinal].filter(Boolean).join(' | ');
    colorFinal = '';
  }
  return { name, qty, remark: remarkFinal, color: colorFinal, children: childrenDefault };
}

function guessGroup(name) {
  const n = (name || '').toLowerCase();
  if (/(box|carton|label|sticker|card|cover|bag|tape|strap|thermocol|polybag|wrap|manual|mrp)/i.test(n)) return 'CMP';
  if (/(motor|blower|assembly|fan|knob|plate|swing|switch|cord|cable|rubber|gromet|bush|section|pin|spring|screw|nut|washer|tie|connector|cap|lover|leaf|housing|tank|capacitor)/i.test(n)) return 'CMP';
  return 'RM';
}

function parseSheet(rows) {
  let headerIdx = -1;
  let title = '';
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] || [];
    const col1 = (r[1] || '').toString().toUpperCase();
    const col2 = (r[2] || '').toString().toUpperCase();
    if (col1.includes('COMPONENT NAME') && col2.includes('QTY')) {
      headerIdx = i;
      if (i > 0) {
        const prev = rows[i - 1] || [];
        if (prev[1] && (prev[0] === '' || prev[0] === undefined || prev[0] === null)) {
          title = prev[1].toString().trim();
        }
      }
      break;
    }
  }
  if (headerIdx === -1) {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] || [];
      if ((r[1] || '').toString().toUpperCase().includes('COMPONENT') && (r[2] || '').toString().toUpperCase().includes('QTY')) {
        headerIdx = i; break;
      }
    }
  }
  if (headerIdx === -1) return { title, items: [] };

  const items = [];
  let lastTop = null;
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] || [];
    const sno = r[0];
    const name = (r[1] || '').toString().trim();
    const remark = (r[3] || '').toString().trim();
    const color = (r[4] || '').toString().trim();
    if (!name) continue;
    const qtyRaw = parseFloat(r[2]);
    const qty = isNaN(qtyRaw) ? 0 : qtyRaw;
    const hasSno = sno !== '' && sno !== undefined && sno !== null && !isNaN(Number(sno)) && String(sno).trim() !== '';
    if (hasSno) {
      const item = normalizeRow(name, qty, remark, color, []);
      items.push(item);
      lastTop = item;
    } else if (lastTop) {
      lastTop.children.push(normalizeRow(name, qty, remark, color, null));
    } else {
      const item = normalizeRow(name, qty, remark, color, []);
      items.push(item);
      lastTop = item;
    }
  }
  return { title, items };
}

async function findOrCreateItem(name, group, defaultUnitId) {
  const norm = normalizeName(name);
  if (norm) {
    const existing = await ItemMaster.findAll({
      where: db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('item_name')), 'LIKE', `%${norm}%`),
      limit: 1,
    });
    if (existing.length > 0) {
      const it = existing[0];
      return { item_id: it.id, item_code: it.item_code, item_name: it.item_name };
    }
  }
  const prefix = group || guessGroup(name);
  const code = await genCode(prefix);
  const created = await ItemMaster.create({
    item_code: code,
    item_name: (name || '').toString().slice(0, 200),
    category_id: null,
    unit_id: defaultUnitId,
    opening_stock: 0,
    current_stock: 0,
    is_active: true,
  });
  return { item_id: created.id, item_code: created.item_code, item_name: created.item_name };
}

exports.importExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const defaultUnit = await Unit.findOne({ where: db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('name')), 'LIKE', '%nos%') });
    const defaultUnitId = defaultUnit ? defaultUnit.id : null;

    const summary = [];
    const errors = [];
    for (const sheetName of wb.SheetNames) {
      try {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
        const { title, items } = parseSheet(rows);
        if (items.length === 0) continue;

        const productName = title || sheetName;
        const product = await findOrCreateItem(productName, 'FG', defaultUnitId);
        const count = await BOM.count();
        const bomNo = `PROD-${String(count + 1).padStart(4, '0')}`;
        const bom = await BOM.create({
          bom_no: bomNo,
          bom_name: sheetName,
          product_item_id: product.item_id,
          product_code: product.item_code,
          product_name: product.item_name,
          output_quantity: 1,
          status: 'Active',
          version: '1.0',
          remarks: `Imported from ${req.file.originalname} (${sheetName})`,
        });

        const flatRows = [];
        let order = 0;
        for (const top of items) {
          const isPhantom = top.children && top.children.length > 0;
          const topLotQty = detectLotQty(top.remark);
          if (isPhantom) {
            const parentTemp = { tempId: ++order, item_name: top.name, is_phantom: true, qty: 0, lot_quantity: 1, remark: top.remark, color: top.color, children: [] };
            flatRows.push(parentTemp);
            for (const child of top.children) {
              const item = await findOrCreateItem(child.name, null, defaultUnitId);
              flatRows.push({
                tempId: ++order,
                parentTempId: parentTemp.tempId,
                item_id: item.item_id,
                item_code: item.item_code,
                item_name: item.item_name,
                quantity: child.qty,
                lot_quantity: detectLotQty(child.remark),
                wastage_percent: 0,
                is_phantom: false,
                color: child.color,
                remarks: child.remark,
              });
            }
          } else {
            const item = await findOrCreateItem(top.name, null, defaultUnitId);
            flatRows.push({
              tempId: ++order,
              item_id: item.item_id,
              item_code: item.item_code,
              item_name: item.item_name,
              quantity: top.qty,
              lot_quantity: topLotQty,
              wastage_percent: 0,
              is_phantom: false,
              color: top.color,
              remarks: top.remark,
            });
          }
        }

        const rowsToInsert = flatRows.map((r) => ({
          bom_id: bom.id,
          parent_item_id: r.parentTempId ? (() => { const p = flatRows.find((x) => x.tempId === r.parentTempId); return flatRows.indexOf(p); })() : null,
          sub_bom_id: null,
          sort_order: flatRows.indexOf(r),
          section_name: r.is_phantom ? r.item_name : null,
          is_phantom: !!r.is_phantom,
          item_id: r.is_phantom ? null : r.item_id,
          item_code: r.item_code || '',
          item_name: (r.item_name || '').toString().slice(0, 200),
          quantity: r.quantity || 0,
          lot_quantity: r.lot_quantity || 1,
          unit_id: null,
          wastage_percent: r.wastage_percent || 0,
          color: r.color || null,
          remarks: r.remarks || '',
        }));
        try {
          await BOMItem.bulkCreate(rowsToInsert);
        } catch (bulkErr) {
          console.error('Bulk insert failed for', sheetName, 'sample row:', JSON.stringify(rowsToInsert[0]));
          console.error('Bulk error:', bulkErr.message);
          console.error('Long fields:', rowsToInsert.filter((r) => (r.item_code || '').length > 50 || (r.item_name || '').length > 50).map((r) => ({ code: r.item_code, name: r.item_name })));
          throw bulkErr;
        }

        summary.push({ sheet: sheetName, bom_no: bomNo, product: product.item_name, components: flatRows.length });
      } catch (sheetErr) {
        errors.push({ sheet: sheetName, error: sheetErr.message });
      }
    }

    res.json({ message: `Imported ${summary.length} BOM(s), ${errors.length} failed`, summary, errors });
  } catch (err) {
    console.error('BOM import error:', err);
    res.status(500).json({ error: 'Failed to import BOM: ' + err.message });
  }
};

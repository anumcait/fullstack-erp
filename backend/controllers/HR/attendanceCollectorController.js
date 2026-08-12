const { RawPunch, PunchBatch } = require('../../models');
const { Op, Sequelize, fn, col } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');

// Multer config for CSV uploads
const uploadDir = path.join(__dirname, '../../uploads/punches');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `punch-${Date.now()}-${file.originalname}`),
});

exports.upload = multer({ storage }).single('file');

// ===== IMPORT CSV =====
exports.importCsv = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const batchId = uuidv4().slice(0, 8);
    const content = fs.readFileSync(req.file.path, 'utf-8');
    const records = csv.parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true });

    const punches = [];
    for (const row of records) {
      const empid = Number(row.empid || row.EmployeeID || row.employee_id || row.EmpID || 0);
      let punchTime = row.punch_time || row.PunchTime || row.DateTime || row.punch_datetime || row.Timestamp;
      if (!punchTime && row.Date && row.Time) punchTime = `${row.Date} ${row.Time}`;

      if (!empid || !punchTime) continue;
      const dt = new Date(punchTime);
      if (isNaN(dt.getTime())) continue;

      punches.push({
        empid,
        punch_time: dt,
        punch_date: dt.toISOString().slice(0, 10),
        direction: (row.direction || row.Direction || row.IOType || 'IN').toUpperCase().includes('OUT') ? 'OUT' : 'IN',
        device_id: row.device_id || row.DeviceID || '',
        device_name: row.device_name || row.DeviceName || req.file.originalname,
        mode: row.mode || row.Mode || row.VerifyMode || 'Fingerprint',
        source: 'CSV',
        batch_id: batchId,
      });
    }

    if (punches.length === 0) return res.status(400).json({ message: 'No valid records found in CSV' });

    await RawPunch.bulkCreate(punches);
    await PunchBatch.create({ batch_id: batchId, source: 'CSV', filename: req.file.originalname, total_records: punches.length });

    // Cleanup uploaded file
    fs.unlink(req.file.path, () => {});

    res.json({ success: true, imported: punches.length, batch_id: batchId });
  } catch (error) {
    res.status(500).json({ message: 'CSV import failed', error: error.message });
  }
};

// ===== API PUSH (for biometric software to call) =====
exports.pushPunch = async (req, res) => {
  try {
    const { empid, punch_time, direction, device_id, device_name, mode } = req.body;
    if (!empid || !punch_time) return res.status(400).json({ message: 'empid and punch_time required' });

    const dt = new Date(punch_time);
    const batchId = `api-${Date.now()}`;

    await RawPunch.create({
      empid: Number(empid),
      punch_time: dt,
      punch_date: dt.toISOString().slice(0, 10),
      direction: direction || 'IN',
      device_id: device_id || 'API',
      device_name: device_name || 'API Push',
      mode: mode || 'API',
      source: 'API',
      batch_id: batchId,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== BULK API PUSH =====
exports.bulkPushPunches = async (req, res) => {
  try {
    const { punches } = req.body;
    if (!punches?.length) return res.status(400).json({ message: 'No punches provided' });

    const batchId = `api-bulk-${Date.now()}`;
    const records = punches.map((p) => {
      const dt = new Date(p.punch_time);
      return {
        empid: Number(p.empid),
        punch_time: dt,
        punch_date: dt.toISOString().slice(0, 10),
        direction: p.direction || 'IN',
        device_id: p.device_id || 'API',
        device_name: p.device_name || 'Bulk API',
        mode: p.mode || 'API',
        source: 'API',
        batch_id: batchId,
      };
    });

    await RawPunch.bulkCreate(records);
    await PunchBatch.create({ batch_id: batchId, source: 'API', total_records: records.length });

    res.status(201).json({ success: true, imported: records.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== MANUAL PUNCH ENTRY =====
exports.manualPunch = async (req, res) => {
  try {
    const { empid, punch_date, punch_in, punch_out } = req.body;
    if (!empid || !punch_date) return res.status(400).json({ message: 'empid and punch_date required' });
    const records = [];
    if (punch_in) {
      const dt = new Date(`${punch_date}T${punch_in}`);
      records.push({ empid: Number(empid), punch_time: dt, punch_date, direction: 'IN', source: 'Manual', batch_id: 'manual' });
    }
    if (punch_out) {
      const dt = new Date(`${punch_date}T${punch_out}`);
      records.push({ empid: Number(empid), punch_time: dt, punch_date, direction: 'OUT', source: 'Manual', batch_id: 'manual' });
    }
    if (records.length) await RawPunch.bulkCreate(records);
    res.json({ success: true, created: records.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== LIST PUNCHES =====
exports.getPunches = async (req, res) => {
  try {
    const { date, empid, processed, batch_id } = req.query;
    const where = {};
    if (date) where.punch_date = date;
    if (empid) where.empid = empid;
    if (processed !== undefined) where.processed = processed === 'true';
    if (batch_id) where.batch_id = batch_id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const { rows, count } = await RawPunch.findAndCountAll({ where, order: [['punch_time', 'DESC']], limit, offset });
    res.json({ data: rows, total: count, page, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== LIST BATCHES =====
exports.getBatches = async (req, res) => {
  try {
    const data = await PunchBatch.findAll({ order: [['created_at', 'DESC']], limit: 20 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Failed', error: error.message });
  }
};

// ===== PROCESS PUNCHES → ATTENDANCE =====
exports.processPunches = async (req, res) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().slice(0, 10);

    // Get all unprocessed punches for the date, ordered by empid and time
    const punches = await RawPunch.findAll({
      where: { punch_date: targetDate, processed: false },
      order: [['empid', 'ASC'], ['punch_time', 'ASC']],
    });

    // Group by empid
    const grouped = {};
    for (const p of punches) {
      if (!grouped[p.empid]) grouped[p.empid] = [];
      grouped[p.empid].push(p);
    }

    let processed = 0;
    let skipped = 0;

    for (const [empidStr, empPunches] of Object.entries(grouped)) {
      const empid = Number(empidStr);
      const firstIn = empPunches.find((p) => p.direction === 'IN') || empPunches[0];
      const lastOut = [...empPunches].reverse().find((p) => p.direction === 'OUT');

      // Check if attendance already exists for this employee on this date
      const GAttendance = require('../../models').GAttendance;
      if (!GAttendance) { skipped += empPunches.length; continue; }

      const existing = await GAttendance.findOne({ where: { empid, adate: targetDate } });
      if (existing) {
        // Update existing
        if (firstIn) existing.in_time = firstIn.punch_time;
        if (lastOut) existing.out_time = lastOut.punch_time;
        await existing.save();
      } else {
        // Create new
        await GAttendance.create({
          empid,
          adate: targetDate,
          in_time: firstIn?.punch_time || null,
          out_time: lastOut?.punch_time || null,
          status: 'Present',
          shift: 'G',
        });
      }

      // Mark punches as processed
      await RawPunch.update({ processed: true }, { where: { id: { [Op.in]: empPunches.map((p) => p.id) } } });
      processed += empPunches.length;
    }

    // Update batch status
    await PunchBatch.update(
      { processed_records: Sequelize.literal(`processed_records + ${processed}`), status: 'Processed' },
      { where: { status: 'Imported' } }
    );

    res.json({ success: true, date: targetDate, processed, skipped });
  } catch (error) {
    res.status(500).json({ message: 'Processing failed', error: error.message });
  }
};

const db = require('../../models/ERP');
const { Op, Sequelize } = require('sequelize');
const { PlanningSchedule, ProductionMachine, ProductionOrder } = db;

exports.list = async (req, res) => {
  try {
    const where = {};
    if (req.query.search) {
      where[Op.or] = [
        { schedule_no: { [Op.iLike]: `%${req.query.search}%` } },
      ];
    }
    if (req.query.status) where.status = req.query.status;
    if (req.query.machine_id) where.machine_id = req.query.machine_id;

    const include = [];
    if (req.query.include !== 'false') {
      include.push(
        { model: ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] },
        { model: ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name', 'planned_quantity'] }
      );
    }

    const rows = await PlanningSchedule.findAll({
      where,
      include,
      order: [['scheduled_date', 'ASC'], ['start_time', 'ASC']],
    });
    res.json(rows);
  } catch (err) { console.error('planSched.list', err); res.status(500).json({ error: 'Failed' }); }
};

exports.get = async (req, res) => {
  try {
    const row = await PlanningSchedule.findByPk(req.params.id, {
      include: [
        { model: ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] },
        { model: ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name', 'planned_quantity'] },
      ],
    });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { console.error('planSched.get', err); res.status(500).json({ error: 'Failed' }); }
};

exports.create = async (req, res) => {
  try {
    const count = await PlanningSchedule.count();
    const year = new Date().getFullYear();
    const schedNo = req.body.schedule_no || `SCH-${year}-${String(count + 1).padStart(4, '0')}`;

    if (req.body.start_time && req.body.end_time) {
      const start = req.body.start_time.split(':');
      const end = req.body.end_time.split(':');
      const hours = (parseInt(end[0]) + parseInt(end[1]) / 60) - (parseInt(start[0]) + parseInt(start[1]) / 60);
      req.body.duration_hours = Math.max(0, hours);
    }

    const row = await PlanningSchedule.create({ ...req.body, schedule_no: schedNo });

    const created = await PlanningSchedule.findByPk(row.id, {
      include: [
        { model: ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] },
        { model: ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name', 'planned_quantity'] },
      ],
    });
    res.status(201).json(created);
  } catch (err) { console.error('planSched.create', err); res.status(500).json({ error: 'Failed' }); }
};

exports.update = async (req, res) => {
  try {
    const row = await PlanningSchedule.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    if (req.body.start_time && req.body.end_time) {
      const start = req.body.start_time.split(':');
      const end = req.body.end_time.split(':');
      const hours = (parseInt(end[0]) + parseInt(end[1]) / 60) - (parseInt(start[0]) + parseInt(start[1]) / 60);
      req.body.duration_hours = Math.max(0, hours);
    }

    await row.update(req.body);
    const updated = await PlanningSchedule.findByPk(row.id, {
      include: [
        { model: ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] },
        { model: ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name', 'planned_quantity'] },
      ],
    });
    res.json(updated);
  } catch (err) { console.error('planSched.update', err); res.status(500).json({ error: 'Failed' }); }
};

exports.remove = async (req, res) => {
  try {
    await PlanningSchedule.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { console.error('planSched.delete', err); res.status(500).json({ error: 'Failed' }); }
};

exports.gantt = async (req, res) => {
  try {
    const machines = await ProductionMachine.findAll({
      where: { status: 'Active', is_active: true },
      attributes: ['id', 'machine_code', 'machine_name', 'capacity_per_hour'],
      order: [['machine_code', 'ASC']],
    });

    const where = {};
    if (req.query.start_date) where.scheduled_date = { [Op.gte]: req.query.start_date };
    if (req.query.end_date) where.scheduled_date = { ...where.scheduled_date, [Op.lte]: req.query.end_date };
    if (req.query.status) where.status = req.query.status;
    where.status = where.status || { [Op.ne]: 'Cancelled' };

    const schedules = await PlanningSchedule.findAll({
      where,
      include: [
        { model: ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] },
        { model: ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name', 'planned_quantity'] },
      ],
      order: [['scheduled_date', 'ASC'], ['start_time', 'ASC']],
    });

    const ganttData = machines.map((m) => ({
      machine: m,
      schedules: schedules.filter((s) => s.machine_id === m.id),
    }));

    res.json({ machines, ganttData, schedules });
  } catch (err) { console.error('planSched.gantt', err); res.status(500).json({ error: 'Failed' }); }
};

exports.reschedule = async (req, res) => {
  try {
    const row = await PlanningSchedule.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });

    const { scheduled_date, start_time, end_time, machine_id, shift } = req.body;
    const updateData = {};
    if (scheduled_date) updateData.scheduled_date = scheduled_date;
    if (start_time) updateData.start_time = start_time;
    if (end_time) updateData.end_time = end_time;
    if (machine_id) updateData.machine_id = machine_id;
    if (shift) updateData.shift = shift;

    if (updateData.start_time && updateData.end_time) {
      const start = updateData.start_time.split(':');
      const end = updateData.end_time.split(':');
      const hours = (parseInt(end[0]) + parseInt(end[1]) / 60) - (parseInt(start[0]) + parseInt(start[1]) / 60);
      updateData.duration_hours = Math.max(0, hours);
    }

    await row.update(updateData);

    const conflicts = await exports._checkConflicts(row.id, {
      machine_id: row.machine_id,
      scheduled_date: row.scheduled_date,
      start_time: row.start_time,
      end_time: row.end_time,
    });

    const updated = await PlanningSchedule.findByPk(row.id, {
      include: [
        { model: ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] },
        { model: ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name', 'planned_quantity'] },
      ],
    });

    res.json({ schedule: updated, conflicts });
  } catch (err) { console.error('planSched.reschedule', err); res.status(500).json({ error: 'Failed' }); }
};

exports._checkConflicts = async (excludeId, { machine_id, scheduled_date, start_time, end_time }) => {
  if (!machine_id || !scheduled_date || !start_time || !end_time) return [];

  const where = {
    machine_id,
    scheduled_date,
    status: { [Op.notIn]: ['Cancelled', 'Completed'] },
    [Op.or]: [
      { start_time: { [Op.lt]: end_time }, end_time: { [Op.gt]: start_time } },
      { start_time: null, end_time: null },
    ],
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };

  const conflicts = await PlanningSchedule.findAll({
    where,
    include: [
      { model: ProductionMachine, as: 'machine', attributes: ['machine_code', 'machine_name'] },
      { model: ProductionOrder, as: 'order', attributes: ['order_no', 'product_name'] },
    ],
  });

  return conflicts;
};

exports.checkConflicts = async (req, res) => {
  try {
    const { machine_id, scheduled_date, start_time, end_time, exclude_id } = req.query;
    const conflicts = await exports._checkConflicts(exclude_id, { machine_id, scheduled_date, start_time, end_time });
    res.json(conflicts);
  } catch (err) { console.error('planSched.checkConflicts', err); res.status(500).json({ error: 'Failed' }); }
};

exports.autoSchedule = async (req, res) => {
  try {
    const { machine_ids, start_date, end_date, consider_capacity } = req.body;

    const schedules = await PlanningSchedule.findAll({
      where: {
        status: 'Planned',
        machine_id: null,
        ...(machine_ids ? { machine_id: machine_ids } : {}),
      },
      include: [
        { model: ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name', 'planned_quantity'] },
      ],
      order: [['createdAt', 'ASC']],
    });

    const machines = await ProductionMachine.findAll({
      where: { status: 'Active', ...(machine_ids ? { id: machine_ids } : {}) },
      order: [['machine_code', 'ASC']],
    });

    if (machines.length === 0) {
      return res.status(400).json({ error: 'No active machines available' });
    }

    const dateStart = start_date ? new Date(start_date) : new Date();
    const dateEnd = end_date ? new Date(end_date) : new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 30);

    const assigned = [];
    let currentDate = new Date(dateStart);

    for (const sched of schedules) {
      let assignedMachine = null;
      let assignedDate = null;
      let attempts = 0;

      while (attempts < 90 && !assignedMachine) {
        const dateStr = currentDate.toISOString().split('T')[0];

        for (const machine of machines) {
          const existingCount = await PlanningSchedule.count({
            where: {
              machine_id: machine.id,
              scheduled_date: dateStr,
              status: { [Op.notIn]: ['Cancelled'] },
            },
          });

          if (consider_capacity && machine.capacity_per_hour) {
            const totalHours = existingCount * 8;
            if (totalHours >= parseFloat(machine.capacity_per_hour)) continue;
          }

          if (existingCount < 3) {
            assignedMachine = machine;
            assignedDate = dateStr;
            break;
          }
        }

        if (!assignedMachine) {
          currentDate.setDate(currentDate.getDate() + 1);
          if (currentDate > dateEnd) break;
        }
        attempts++;
      }

      if (assignedMachine && assignedDate) {
        const shiftOrder = ['Day', 'Evening', 'Night'];
        const existingScheds = await PlanningSchedule.findAll({
          where: { machine_id: assignedMachine.id, scheduled_date: assignedDate, status: { [Op.notIn]: ['Cancelled'] } },
          order: [['start_time', 'ASC']],
        });

        const shiftIndex = existingScheds.length < 3 ? existingScheds.length : 0;
        const shift = shiftOrder[shiftIndex] || 'Day';

        const timeSlots = { Day: ['06:00', '14:00'], Evening: ['14:00', '22:00'], Night: ['22:00', '06:00'] };
        const [st, et] = timeSlots[shift];

        await sched.update({
          machine_id: assignedMachine.id,
          scheduled_date: assignedDate,
          shift,
          start_time: st,
          end_time: et,
          duration_hours: 8,
        });

        assigned.push({
          id: sched.id,
          schedule_no: sched.schedule_no,
          machine_id: assignedMachine.id,
          machine_name: assignedMachine.machine_name,
          scheduled_date: assignedDate,
          shift,
          order_no: sched.order?.order_no,
          product_name: sched.order?.product_name,
        });
      }
    }

    res.json({ assigned, total: schedules.length, assigned_count: assigned.length });
  } catch (err) { console.error('planSched.autoSchedule', err); res.status(500).json({ error: 'Failed' }); }
};

exports.calendar = async (req, res) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || (new Date().getMonth() + 1);
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const endDate = new Date(y, m, 0).toISOString().split('T')[0];

    const schedules = await PlanningSchedule.findAll({
      where: {
        scheduled_date: { [Op.between]: [startDate, endDate] },
        status: { [Op.ne]: 'Cancelled' },
      },
      include: [
        { model: ProductionMachine, as: 'machine', attributes: ['id', 'machine_code', 'machine_name'] },
        { model: ProductionOrder, as: 'order', attributes: ['id', 'order_no', 'product_name'] },
      ],
      order: [['scheduled_date', 'ASC'], ['start_time', 'ASC']],
    });

    const grouped = {};
    for (const s of schedules) {
      const key = s.scheduled_date;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    }

    res.json({ year: y, month: m, schedules, grouped });
  } catch (err) { console.error('planSched.calendar', err); res.status(500).json({ error: 'Failed' }); }
};

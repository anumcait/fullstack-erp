const { AdvanceApplication, Payslip } = require('../../models');
const { Sequelize, Op } = require('sequelize');

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

exports.saveAdvance = async (req, res) => {
  const application = req.body;
  const t = await AdvanceApplication.sequelize.transaction();

  try {
    const maxIdResult = await AdvanceApplication.findOne({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('advance_id')), 0), 'maxId']
      ],
      raw: true
    });

    const nextAdvanceId = Number(maxIdResult.maxId) + 1;
    application.advance_id = nextAdvanceId;
    application.status = 'Pending';

    await AdvanceApplication.create(application, { transaction: t });
    await t.commit();

    res.status(201).json({ message: 'Advance application saved.', advance_id: nextAdvanceId });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error saving Advance application:', error);
    res.status(500).json({ message: 'Failed to save Advance application.', error });
  }
};

exports.getNextAdvanceNumber = async (req, res) => {
  try {
    const maxId = await AdvanceApplication.max('advance_id');
    const nextId = (maxId || 0) + 1;
    res.json({ nextAdvanceId: nextId });
  } catch (error) {
    console.error('❌ Error fetching next advance_id:', error);
    res.status(500).json({ message: 'Failed to get next Advance ID.' });
  }
};

exports.getAllAdvanceApplications = async (req, res) => {
  try {
    const { empid, from, to } = req.query;
    const where = {};

    if (empid) where.empid = empid;
    if (from && to) where.advance_date = { [Sequelize.Op.between]: [from, to] };

    const data = await AdvanceApplication.findAll({
      where,
      order: [['advance_id', 'DESC']]
    });

    const empIds = [...new Set(data.map((a) => a.empid).filter((id) => id != null))];
    let deductedKeys = new Set();
    if (empIds.length > 0) {
      const paid = await Payslip.findAll({
        attributes: ['C_EMPID', 'C_YEAR', 'C_MONTH'],
        where: {
          C_EMPID: { [Op.in]: empIds },
          C_DED_ADV: { [Op.gt]: 0 },
          C_FINAL_STATUS: 2
        },
        raw: true
      });
      deductedKeys = new Set(paid.map((p) => `${p.C_EMPID}|${p.C_YEAR}|${p.C_MONTH}`));
    }

    const dataWithStatus = data.map((adv) => {
      let schedule = [];
      if (adv.deduction_schedule) {
        try {
          const parsed = typeof adv.deduction_schedule === 'string'
            ? JSON.parse(adv.deduction_schedule)
            : adv.deduction_schedule;
          if (Array.isArray(parsed)) schedule = parsed;
        } catch (e) { /* ignore invalid schedule */ }
      }
      const scheduleWithStatus = schedule.map((entry) => {
        const monthNum = parseInt(entry.month) || 1;
        const yearNum = parseInt(entry.year) || 0;
        const deducted = deductedKeys.has(`${adv.empid}|${yearNum}|${MONTH_NAMES[monthNum - 1]}`);
        return { ...entry, month: monthNum, year: yearNum, deducted };
      });

      const deductedCount = scheduleWithStatus.filter((e) => e.deducted).length;
      const deductedAmount = scheduleWithStatus.reduce((s, e) => s + (e.deducted ? (parseFloat(e.amount) || 0) : 0), 0);
      const totalAdvAmount = parseFloat(adv.advance_amount) || 0;
      const pendingAmount = adv.status === 'Approved' ? Math.max(0, totalAdvAmount - deductedAmount) : 0;

      let overallStatus;
      if (adv.status !== 'Approved') {
        overallStatus = adv.status || 'Pending';
      } else if (scheduleWithStatus.length === 0) {
        overallStatus = 'Pending';
      } else if (deductedCount === 0) {
        overallStatus = 'Pending';
      } else if (deductedCount >= scheduleWithStatus.length) {
        overallStatus = 'Completed';
      } else {
        overallStatus = 'Partially Completed';
      }

      return {
        ...adv.toJSON(),
        schedule_with_status: scheduleWithStatus,
        overall_status: overallStatus,
        pending_amount: Math.round(pendingAmount * 100) / 100
      };
    });

    res.json(dataWithStatus);
  } catch (error) {
    console.error('❌ Error fetching Advance applications:', error);
    res.status(500).json({ message: 'Failed to fetch Advance data.' });
  }
};

exports.getPendingAdvances = async (req, res) => {
  try {
    const data = await AdvanceApplication.findAll({
      where: { status: 'Pending' },
      order: [['advance_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching pending Advance applications:', error);
    res.status(500).json({ message: 'Failed to fetch pending Advance applications.' });
  }
};

exports.approveAdvance = async (req, res) => {
  const { advance_id, status, remarks, deduction_schedule } = req.body;
  
  try {
    const application = await AdvanceApplication.findOne({
      where: { advance_id }
    });

    if (!application) {
      return res.status(404).json({ message: 'Advance application not found.' });
    }

    application.status = status === 'Reject' ? 'Rejected' : status || 'Approved';
    if (remarks) application.remarks = remarks;
    if (deduction_schedule) {
      const schedule = typeof deduction_schedule === 'string' ? JSON.parse(deduction_schedule) : deduction_schedule;
      application.deduction_schedule = JSON.stringify(schedule);
      if (schedule.length > 0) {
        application.deduct_from_month = schedule[0].month;
        application.deduct_from_year = schedule[0].year;
      }
    }
    await application.save();

    res.json({ success: true, message: `Advance application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving Advance application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve Advance application.', error });
  }
};

exports.cancelAdvance = async (req, res) => {
  const { advance_id, remarks = "" } = req.body;
  try {
    const app = await AdvanceApplication.findOne({ where: { advance_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Cancelled', remarks: remarks });
    res.json({ success: true, message: "Advance approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling Advance" });
  }
};

exports.reopenAdvance = async (req, res) => {
  const { advance_id } = req.body;
  try {
    const app = await AdvanceApplication.findOne({ where: { advance_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Pending' });
    res.json({ success: true, message: "Advance application reopened" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error reopening Advance" });
  }
};

exports.getAdvanceReport = async (req, res) => {
  try {
    const { startDate, endDate, empid } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.advance_date = { [Op.between]: [startDate, endDate] };
    }
    if (empid) {
      where.empid = empid;
    }
    
    const advances = await AdvanceApplication.findAll({
      where,
      order: [['advance_date', 'DESC']]
    });
    
    res.json(advances);
  } catch (error) {
    console.error('Error fetching advance report:', error);
    res.status(500).json({ message: 'Error fetching advance report' });
  }
};

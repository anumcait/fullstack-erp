const { OnDutyApplication, Payslip } = require('../../models');
const { Sequelize } = require('sequelize');

function getMonthName(month) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return months[month - 1];
}

exports.saveOnDuty = async (req, res) => {
  const application = req.body;
  const t = await OnDutyApplication.sequelize.transaction();

  try {
    // 🛑 Check if any payslip is already generated for this employee (Find Max Month/Year)
    if (application.act_date && application.empid) {
      const [y, m, d] = application.act_date.split('-').map(Number);

      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const monthMap = {};
      monthNames.forEach((name, idx) => { monthMap[name] = idx + 1; });

      const monthOrder = `CASE 
        WHEN "C_MONTH" IN ('JAN','JANUARY','01','1') THEN 1
        WHEN "C_MONTH" IN ('FEB','FEBRUARY','02','2') THEN 2
        WHEN "C_MONTH" IN ('MAR','MARCH','03','3') THEN 3
        WHEN "C_MONTH" IN ('APR','APRIL','04','4') THEN 4
        WHEN "C_MONTH" IN ('MAY','MAY','05','5') THEN 5
        WHEN "C_MONTH" IN ('JUN','JUNE','06','6') THEN 6
        WHEN "C_MONTH" IN ('JUL','JULY','07','7') THEN 7
        WHEN "C_MONTH" IN ('AUG','AUGUST','08','8') THEN 8
        WHEN "C_MONTH" IN ('SEP','SEPTEMBER','09','9') THEN 9
        WHEN "C_MONTH" IN ('OCT','OCTOBER','10','10') THEN 10
        WHEN "C_MONTH" IN ('NOV','NOVEMBER','11','11') THEN 11
        WHEN "C_MONTH" IN ('DEC','DECEMBER','12','12') THEN 12
        ELSE 0 END`;

      const latest = await Payslip.findOne({
        where: {
          [Sequelize.Op.or]: [
            { C_EMPID: application.empid },
            { C_EMPID: parseInt(application.empid) || 0 }
          ]
        },
        attributes: ['C_MONTH', 'C_YEAR'],
        order: [
          ['C_YEAR', 'DESC'],
          [Sequelize.literal(monthOrder), 'DESC']
        ],
        raw: true
      });

      if (latest) {
        const finalMonthStr = (latest.C_MONTH || "").trim().toUpperCase();
        const latestMonthNum = monthMap[finalMonthStr] || 0;
        const latestYearNum = Number(latest.C_YEAR);
        
        // isClosed if selected year < latest year OR (same year and selected month <= latest month)
        const isClosed = (y < latestYearNum) || (y === latestYearNum && m <= latestMonthNum);

        if (isClosed) {
          await t.rollback();
          return res.status(400).json({ 
            message: `Cannot save On Duty. Payroll has already been processed up to ${finalMonthStr} ${latestYearNum}. Backdated entries are not allowed for closed months.` 
          });
        }
      }

    }
    const maxIdResult = await OnDutyApplication.findOne({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('MAX', Sequelize.col('movement_id')), 0), 'maxId']
      ],
      raw: true
    });

    const nextMovementId = Number(maxIdResult.maxId) + 1;
    application.movement_id = nextMovementId;

    await OnDutyApplication.create(application, { transaction: t });
    await t.commit();

    res.status(201).json({ message: 'On Duty application saved.', movement_id: nextMovementId });
  } catch (error) {
    await t.rollback();
    console.error('❌ Error saving On Duty application:', error);
    res.status(500).json({ message: 'Failed to save On Duty application.', error });
  }
};

exports.getNextOnDutyNumber = async (req, res) => {
  try {
    const maxId = await OnDutyApplication.max('movement_id');
    const nextId = (maxId || 0) + 1;
    console.log('nextId:', nextId);
    res.json({ nextMovementId: nextId });
  } catch (error) {
    console.error('❌ Error fetching next movement_id:', error);
    res.status(500).json({ message: 'Failed to get next On Duty ID.' });
  }
};

exports.getAllOnDutyApplications = async (req, res) => {
  try {
    const { empid, from, to } = req.query;
    const where = {};

    if (empid) where.empid = empid;
    if (from && to) where.movement_date = { [Sequelize.Op.between]: [from, to] };

    const data = await OnDutyApplication.findAll({
      where,
      order: [['movement_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching On Duty applications:', error);
    res.status(500).json({ message: 'Failed to fetch On Duty data.' });
  }
};

exports.getPendingOnDuty = async (req, res) => {
  try {
    const data = await OnDutyApplication.findAll({
      where: { status: 'Pending' },
      order: [['movement_id', 'DESC']]
    });

    res.json(data);
  } catch (error) {
    console.error('❌ Error fetching pending On Duty applications:', error);
    res.status(500).json({ message: 'Failed to fetch pending On Duty applications.' });
  }
};

exports.approveOnDuty = async (req, res) => {
  const { movement_id, status, remarks } = req.body;

  try {
    const application = await OnDutyApplication.findOne({
      where: { movement_id }
    });

    if (!application) {
      return res.status(404).json({ message: 'On Duty application not found.' });
    }

    application.status = status === 'Reject' ? 'Rejected' : status || 'Approved';
    if (remarks) application.remarks = remarks;
    await application.save();

    res.json({ success: true, message: `On Duty application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving On Duty application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve On Duty application.', error });
  }
};

exports.cancelOnDuty = async (req, res) => {
  const { movement_id, remarks = "" } = req.body;
  try {
    const app = await OnDutyApplication.findOne({ where: { movement_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    // Set status to Cancelled (2 or string 'Cancelled')
    // Checking current model to see if it's string or int
    // Based on saveOnDuty, it seems to use strings.
    await app.update({ status: 'Cancelled', remarks: remarks });

    res.json({ success: true, message: "On Duty approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling On Duty" });
  }
};

exports.reopenOnDuty = async (req, res) => {
  const { movement_id } = req.body;
  try {
    const app = await OnDutyApplication.findOne({ where: { movement_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Pending' });

    res.json({ success: true, message: "On Duty application reopened" });
  } catch (error) {
    console.error(error);
  }
};

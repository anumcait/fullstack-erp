const { WoffApplication, Payslip } = require('../../models');
const { Sequelize } = require('sequelize');

exports.getAllWoffs = async (req, res) => {
  try {
    const woffs = await WoffApplication.findAll({
      order: [['woff_id', 'DESC']]
    });
    res.json(woffs);
  } catch (err) {
    console.error('Error fetching woffs:', err);
    res.status(500).json({ message: 'Error fetching woff applications' });
  }
};

exports.getWoffById = async (req, res) => {
  try {
    const woff = await WoffApplication.findByPk(req.params.id);
    if (!woff) {
      return res.status(404).json({ message: 'Woff not found' });
    }
    res.json(woff);
  } catch (err) {
    console.error('Error fetching woff:', err);
    res.status(500).json({ message: 'Error fetching woff application' });
  }
};

exports.getNextWoffId = async (req, res) => {
  try {
    const maxId = await WoffApplication.max('woff_id') || 0;
    res.json({ nextWoffId: maxId + 1 });
  } catch (err) {
    console.error('Error getting next woff ID:', err);
    res.status(500).json({ message: 'Error getting next woff ID' });
  }
};

exports.createWoff = async (req, res) => {
  try {
    const { empid, woff_from_date, woff_to_date, ename } = req.body;

    if (!empid || !woff_from_date || !woff_to_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 🛑 Check if payroll is already generated (Find Max Month/Year)
    if (woff_from_date && empid) {
      const [y, m, d] = woff_from_date.split('-').map(Number);
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

      const latestPayslip = await Payslip.findOne({
        attributes: ['C_MONTH', 'C_YEAR'],
        order: [['C_YEAR', 'DESC'], [Sequelize.literal(monthOrder), 'DESC']],
        raw: true
      });

      if (latestPayslip) {
        const finalMonthStr = (latestPayslip.C_MONTH || "").trim().toUpperCase();
        const latestMonthNum = monthMap[finalMonthStr] || 0;
        const latestYearNum = Number(latestPayslip.C_YEAR);
        const isClosed = (y < latestYearNum) || (y === latestYearNum && m <= latestMonthNum);

        if (isClosed) {
          return res.status(400).json({ 
            message: `Cannot apply for Woff Change. Payroll already processed up to ${finalMonthStr} ${latestYearNum}.` 
          });
        }
      }
    }

    if (woff_from_date === woff_to_date) {
      return res.status(400).json({ message: 'Existing date and Changed date cannot be the same.' });
    }

    // 1. Check if application already exists for this Existing Date
    const existingFrom = await WoffApplication.findOne({
      where: {
        empid,
        woff_from_date: woff_from_date,
        status: ['Pending', 'Approved']
      }
    });

    if (existingFrom) {
      return res.status(400).json({ message: `A Woff change application already exists for ${woff_from_date}.` });
    }

    // 2. Check if changed date is already a Woff date in another application
    const existingTo = await WoffApplication.findOne({
      where: {
        empid,
        woff_to_date: woff_to_date,
        status: ['Pending', 'Approved']
      }
    });

    if (existingTo) {
      return res.status(400).json({ message: `A Woff change is already requested for ${woff_to_date}.` });
    }

    // 3. Check for overlaps with other modules (OnDuty, Leave, etc.) - Placeholder logic
    // In a real scenario, we would check OD, Leave, and Tour tables here.

    const maxId = await WoffApplication.max('woff_id') || 0;
    const newWoffId = Number(maxId) + 1;

    const woff = await WoffApplication.create({
      ...req.body,
      woff_id: newWoffId,
      woff_date: new Date(),
      created_by: ename,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Woff application created', data: woff });
  } catch (err) {
    console.error('Error creating woff:', err);
    res.status(500).json({ message: 'Error creating woff application', error: err.message });
  }
};

exports.updateWoff = async (req, res) => {
  try {
    const { id } = req.params;
    const woff = await WoffApplication.findByPk(id);
    
    if (!woff) {
      return res.status(404).json({ message: 'Woff not found' });
    }

    await woff.update(req.body);
    res.json({ message: 'Woff updated', data: woff });
  } catch (err) {
    console.error('Error updating woff:', err);
    res.status(500).json({ message: 'Error updating woff' });
  }
};

exports.deleteWoff = async (req, res) => {
  try {
    const { id } = req.params;
    const woff = await WoffApplication.findByPk(id);
    
    if (!woff) {
      return res.status(404).json({ message: 'Woff not found' });
    }

    await woff.destroy();
    res.json({ message: 'Woff deleted' });
  } catch (err) {
    console.error('Error deleting woff:', err);
    res.status(500).json({ message: 'Error deleting woff' });
  }
};

exports.approveWoff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_remark } = req.body;
    
    const woff = await WoffApplication.findByPk(id);
    if (!woff) {
      return res.status(404).json({ message: 'Woff not found' });
    }
    
    await woff.update({
      status,
      approval_remark,
      approved_by: req.session.user?.username || 'Admin',
      approved_date: new Date()
    });
    
    res.json({ message: `Woff ${status}` });
  } catch (err) {
    console.error('Error approving woff:', err);
    res.status(500).json({ message: 'Error approving woff' });
  }
};

exports.getPendingWoffChanges = async (req, res) => {
  try {
    const data = await WoffApplication.findAll({
      where: { status: 'Pending' },
      order: [['woff_id', 'DESC']]
    });

    res.json(data);
  } catch (err) {
    console.error('Error fetching pending woff applications:', err);
    res.status(500).json({ message: 'Error fetching pending woff applications' });
  }
};

exports.approveWoffChange = async (req, res) => {
  const { woff_id, status, remarks } = req.body;
  
  try {
    const application = await WoffApplication.findOne({
      where: { woff_id }
    });

    if (!application) {
      return res.status(404).json({ message: 'Woff application not found.' });
    }

    application.status = status === 'Reject' ? 'Rejected' : status || 'Approved';
    if (remarks) application.remarks = remarks;
    await application.save();

    res.json({ success: true, message: `Woff application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving Woff application:', error);
    res.status(500).json({ success: false, message: 'Failed to approve Woff application.', error });
  }
};

exports.cancelWoff = async (req, res) => {
  const { woff_id, remarks = "" } = req.body;
  try {
    const app = await WoffApplication.findOne({ where: { woff_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Cancelled', remarks: remarks });
    res.json({ success: true, message: "Woff approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling Woff" });
  }
};

exports.reopenWoff = async (req, res) => {
  const { woff_id } = req.body;
  try {
    const app = await WoffApplication.findOne({ where: { woff_id } });
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Pending' });
    res.json({ success: true, message: "Woff application reopened" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error reopening Woff" });
  }
};

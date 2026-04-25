const { ExtOt, EmployeeMaster, User } = require('../../models');
const { Sequelize } = require('sequelize');

function calculateOtHrs(inTime, outTime) {
  if (!inTime || !outTime) return 0;
  
  const inDate = new Date(`2000-01-01 ${inTime}`);
  const outDate = new Date(`2000-01-01 ${outTime}`);
  
  let diffMs = outDate - inDate;
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
  
  const totalMins = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return h + m / 100; // HH.MM format
}

exports.create = async (req, res) => {
  try {
    const { empid, ename, ot_date, in_time, out_time, ot_type, emp_remarks } = req.body;
    
    console.log('Ext OT Create:', { empid, ename, ot_date, in_time, out_time, ot_type });
    
    const existing = await ExtOt.findOne({
      where: {
        empid: parseInt(empid),
        ot_date: ot_date
      }
    });
    
    if (existing) {
      if (existing.app_status !== 0) {
        return res.status(400).json({ message: 'Already approved. Cannot modify.' });
      }
      const autoOtHrs = calculateOtHrs(in_time, out_time);
      await existing.update({
        in_time,
        out_time,
        ot_hrs: autoOtHrs,
        ot_type,
        emp_remarks
      });
      return res.status(200).json({ message: 'Ext OT updated', data: existing });
    }
    
    const autoOtHrs = calculateOtHrs(in_time, out_time);
    
    const maxIdResult = await ExtOt.max('id');
    const maxId = maxIdResult ? parseInt(maxIdResult) : 0;
    
    const extOt = await ExtOt.create({
      id: maxId + 1,
      empid: parseInt(empid),
      ename,
      ot_date,
      in_time,
      out_time,
      ot_hrs: autoOtHrs,
      ot_type,
      emp_remarks,
      app_status: 0,
      created_by: req.user?.id,
      created_dt: new Date()
    });
    
    console.log('Ext OT Created:', extOt.id);
    res.status(201).json({ message: 'Ext OT created', data: extOt });
  } catch (error) {
    console.error('Error creating ext OT:', error);
    res.status(500).json({ message: 'Error creating ext OT', error: error.message, stack: error.stack });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { in_time, out_time, ot_type, emp_remarks, ot_hrs } = req.body;
    
    const extOt = await ExtOt.findByPk(id);
    if (!extOt) {
      return res.status(404).json({ message: 'Ext OT not found' });
    }
    
    if (extOt.app_status !== 0) {
      return res.status(400).json({ message: 'Cannot update - already approved' });
    }
    
    const autoOtHrs = (in_time && out_time) ? calculateOtHrs(in_time, out_time) : extOt.ot_hrs;
    const finalOtHrs = (ot_hrs !== undefined && ot_hrs !== null && ot_hrs !== '') ? parseFloat(ot_hrs) : autoOtHrs;
    
    await extOt.update({
      in_time: in_time || extOt.in_time,
      out_time: out_time || extOt.out_time,
      ot_hrs: finalOtHrs,
      ot_type,
      emp_remarks
    });
    
    res.json({ message: 'Ext OT updated', data: extOt });
  } catch (error) {
    console.error('Error updating ext OT:', error);
    res.status(500).json({ message: 'Error updating ext OT', error: error.message });
  }
};

exports.hrUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { ot_hrs } = req.body;
    
    const extOt = await ExtOt.findByPk(id);
    if (!extOt) {
      return res.status(404).json({ message: 'Ext OT not found' });
    }
    
    if (extOt.app_status === 0) {
      return res.status(400).json({ message: 'Must be HR approved first' });
    }
    
    await extOt.update({ ot_hrs: parseFloat(ot_hrs) });
    
    res.json({ message: 'OT hours updated', data: extOt });
  } catch (error) {
    console.error('Error HR updating ext OT:', error);
    res.status(500).json({ message: 'Error updating ext OT', error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate, empid, month, year, status } = req.query;
    
    console.log('Ext OT getAll params:', { startDate, endDate, empid, month, year, status });
    
    const where = {};
    
    if (startDate && endDate) {
      where.ot_date = { [Sequelize.Op.between]: [startDate, endDate] };
    } else if (month && year) {
      const m = parseInt(month);
      const y = parseInt(year);
      const startOfMonth = `${y}-${String(m).padStart(2, '0')}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const endOfMonth = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      where.ot_date = { [Sequelize.Op.between]: [startOfMonth, endOfMonth] };
    }
    
    if (empid) {
      where.empid = parseInt(empid);
    }
    
    if (status !== undefined) {
      where.app_status = parseInt(status);
    }
    
    console.log('Ext OT where:', where);
    
    const data = await ExtOt.findAll({
      where,
      order: [['ot_date', 'DESC'], ['empid', 'ASC']]
    });
    
    console.log('Ext OT found:', data.length);
    res.json(data);
  } catch (error) {
    console.error('Error fetching ext OT:', error);
    res.status(500).json({ message: 'Error fetching ext OT', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const extOt = await ExtOt.findByPk(id);
    
    if (!extOt) {
      return res.status(404).json({ message: 'Ext OT not found' });
    }
    
    res.json(extOt);
  } catch (error) {
    console.error('Error fetching ext OT:', error);
    res.status(500).json({ message: 'Error fetching ext OT', error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const extOt = await ExtOt.findByPk(id);
    
    if (!extOt) {
      return res.status(404).json({ message: 'Ext OT not found' });
    }
    
    if (extOt.app_status !== 0) {
      return res.status(400).json({ message: 'Cannot delete - already approved' });
    }
    
    await extOt.destroy();
    
    res.json({ message: 'Ext OT deleted' });
  } catch (error) {
    console.error('Error deleting ext OT:', error);
    res.status(500).json({ message: 'Error deleting ext OT', error: error.message });
  }
};

exports.managerApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_remarks, ot_hrs } = req.body;
    
    const extOt = await ExtOt.findByPk(id);
    if (!extOt) {
      return res.status(404).json({ message: 'Ext OT not found' });
    }
    
    if (extOt.app_status !== 0) {
      return res.status(400).json({ message: 'Invalid status for manager approval' });
    }
    
    await extOt.update({
      app_status: 1,
      manager_remarks,
      ot_hrs: ot_hrs || extOt.ot_hrs,
      manager_approved_by: req.user?.id,
      manager_approved_dt: new Date()
    });
    
    res.json({ message: 'Manager approved', data: extOt });
  } catch (error) {
    console.error('Error manager approving ext OT:', error);
    res.status(500).json({ message: 'Error manager approving ext OT', error: error.message });
  }
};

exports.hrApprove = async (req, res) => {
  try {
    const { id } = req.params;
    const { hr_remarks, ot_hrs } = req.body;
    
    const extOt = await ExtOt.findByPk(id);
    if (!extOt) {
      return res.status(404).json({ message: 'Ext OT not found' });
    }
    
    if (extOt.app_status !== 1) {
      return res.status(400).json({ message: 'Must be manager approved first' });
    }
    
    await extOt.update({
      app_status: 2,
      ot_hrs: ot_hrs || extOt.ot_hrs,
      hr_remarks,
      hr_approved_by: req.user?.id,
      hr_approved_dt: new Date()
    });
    
    res.json({ message: 'HR approved', data: extOt });
  } catch (error) {
    console.error('Error HR approving ext OT:', error);
    res.status(500).json({ message: 'Error HR approving ext OT', error: error.message });
  }
};

exports.managerBulkApprove = async (req, res) => {
  try {
    const { ids, manager_remarks } = req.body;
    
    await ExtOt.update({
      app_status: 1,
      manager_remarks,
      manager_approved_by: req.user?.id,
      manager_approved_dt: new Date()
    }, {
      where: {
        id: { [Sequelize.Op.in]: ids },
        app_status: 0
      }
    });
    
    res.json({ message: 'Bulk manager approved' });
  } catch (error) {
    console.error('Error bulk manager approving ext OT:', error);
    res.status(500).json({ message: 'Error bulk manager approving', error: error.message });
  }
};

exports.hrBulkApprove = async (req, res) => {
  try {
    const { ids, hr_remarks } = req.body;
    
    await ExtOt.update({
      app_status: 2,
      hr_remarks,
      hr_approved_by: req.user?.id,
      hr_approved_dt: new Date()
    }, {
      where: {
        id: { [Sequelize.Op.in]: ids },
        app_status: 1
      }
    });
    
    res.json({ message: 'Bulk HR approved' });
  } catch (error) {
    console.error('Error bulk HR approving ext OT:', error);
    res.status(500).json({ message: 'Error bulk HR approving', error: error.message });
  }
};

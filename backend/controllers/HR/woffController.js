const { WoffApplication } = require('../../models');

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
    const { empid, ename, unit, division, designation, current_woff_day, requested_woff_day, woff_from_date, woff_to_date, reason } = req.body;
    
    const maxId = await WoffApplication.max('woff_id') || 0;
    const newWoffId = maxId + 1;

    const woff = await WoffApplication.create({
      woff_id: newWoffId,
      woff_date: new Date(),
      empid,
      ename,
      unit,
      division,
      designation,
      current_woff_day,
      requested_woff_day,
      woff_from_date,
      woff_to_date,
      reason,
      created_by: ename,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Woff application created', data: woff });
  } catch (err) {
    console.error('Error creating woff:', err);
    res.status(500).json({ message: 'Error creating woff application' });
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

    res.json({ message: `Woff application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving Woff application:', error);
    res.status(500).json({ message: 'Failed to approve Woff application.', error });
  }
};

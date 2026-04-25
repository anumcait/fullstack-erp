const { OnDutyApplication } = require('../../models');
const { Sequelize } = require('sequelize');

exports.saveOnDuty = async (req, res) => {
  const application = req.body;
  const t = await OnDutyApplication.sequelize.transaction();

  try {
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
    console.log('nextId:',nextId);
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

    res.json({ message: `On Duty application ${application.status.toLowerCase()}d successfully.` });
  } catch (error) {
    console.error('❌ Error approving On Duty application:', error);
    res.status(500).json({ message: 'Failed to approve On Duty application.', error });
  }
};

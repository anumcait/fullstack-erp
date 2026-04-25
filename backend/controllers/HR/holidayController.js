const { Holiday } = require('../../models');
const { Sequelize } = require('sequelize');

exports.getAllHolidays = async (req, res) => {
  try {
    const { year } = req.query;
    const where = year ? { yr: parseInt(year) } : {};
    const holidays = await Holiday.findAll({
      where,
      order: [['hdate', 'ASC']]
    });
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ message: 'Error fetching holidays', error: error.message });
  }
};

exports.saveHoliday = async (req, res) => {
  try {
    const holidayData = req.body;
    await Holiday.upsert(holidayData);
    res.json({ message: 'Holiday saved successfully' });
  } catch (error) {
    console.error('Error saving holiday:', error);
    res.status(500).json({ message: 'Error saving holiday' });
  }
};

exports.saveBulkHolidays = async (req, res) => {
  const t = await Holiday.sequelize.transaction();
  try {
    const holidays = req.body;
    for (const h of holidays) {
      await Holiday.upsert(h, { transaction: t });
    }
    await t.commit();
    res.json({ message: 'Holidays saved successfully', count: holidays.length });
  } catch (error) {
    await t.rollback();
    console.error('Error saving holidays:', error);
    res.status(500).json({ message: 'Error saving holidays' });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { hno } = req.params;
    await Holiday.destroy({ where: { hno } });
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ message: 'Error deleting holiday' });
  }
};

exports.getHolidayForDate = async (req, res) => {
  try {
    const { date, year } = req.query;
    const holiday = await Holiday.findOne({
      where: {
        hdate: date,
        yr: parseInt(year) || new Date().getFullYear()
      }
    });
    res.json(holiday || null);
  } catch (error) {
    console.error('Error fetching holiday:', error);
    res.status(500).json({ message: 'Error fetching holiday' });
  }
};

exports.getNextHno = async (req, res) => {
  try {
    const last = await Holiday.findOne({ order: [['hno', 'DESC']] });
    res.json({ hno: last ? last.hno + 1 : 1 });
  } catch (error) {
    console.error('Error getting next hno:', error);
    res.status(500).json({ message: 'Error getting next holiday number' });
  }
};

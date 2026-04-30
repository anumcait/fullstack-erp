const { TourApplication, EmployeeMaster } = require('../../models');
const { Op } = require('sequelize');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await TourApplication.findAll({
      order: [['tour_id', 'DESC']]
    });
    res.json(tours);
  } catch (err) {
    console.error('Error fetching tours:', err);
    res.status(500).json({ message: 'Error fetching tours' });
  }
};

exports.getNextTourId = async (req, res) => {
  try {
    const maxId = await TourApplication.max('tour_id') || 0;
    res.json({ nextTourId: maxId + 1 });
  } catch (err) {
    console.error('Error getting next tour ID:', err);
    res.status(500).json({ message: 'Error getting next tour ID' });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await TourApplication.findByPk(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }
    res.json(tour);
  } catch (err) {
    console.error('Error fetching tour:', err);
    res.status(500).json({ message: 'Error fetching tour' });
  }
};

exports.getPendingTours = async (req, res) => {
  try {
    const tours = await TourApplication.findAll({
      where: { status: 'Pending' },
      order: [['tour_id', 'DESC']]
    });
    res.json(tours);
  } catch (err) {
    console.error('Error fetching pending tours:', err);
    res.status(500).json({ message: 'Error fetching pending tours' });
  }
};

exports.createTour = async (req, res) => {
  try {
    const { empid, ename, unit, division, designation, tour_from_date, tour_to_date, purpose, destination, estimated_amount } = req.body;
    
    const maxId = await TourApplication.max('tour_id') || 0;
    const newTourId = maxId + 1;

    const tour = await TourApplication.create({
      tour_id: newTourId,
      tour_date: new Date(),
      empid,
      ename,
      unit,
      division,
      designation,
      tour_from_date,
      tour_to_date: tour_to_date && tour_to_date !== '' ? tour_to_date : null,
      purpose,
      destination,
      estimated_amount: estimated_amount || null,
      created_by: ename,
      status: 'Pending'
    });

    res.status(201).json({ message: 'Tour application created', data: tour });
  } catch (err) {
    console.error('Error creating tour:', err);
    res.status(500).json({ message: 'Error creating tour application' });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await TourApplication.findByPk(id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    await tour.update(req.body);
    res.json({ message: 'Tour updated', data: tour });
  } catch (err) {
    console.error('Error updating tour:', err);
    res.status(500).json({ message: 'Error updating tour' });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await TourApplication.findByPk(id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    await tour.destroy();
    res.json({ message: 'Tour deleted' });
  } catch (err) {
    console.error('Error deleting tour:', err);
    res.status(500).json({ message: 'Error deleting tour' });
  }
};

exports.approveTour = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approval_remark } = req.body;
    
    const tour = await TourApplication.findByPk(id);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    await tour.update({
      status,
      approval_remark,
      approved_by: req.session.user?.username || 'Admin',
      approved_date: new Date()
    });

    res.json({ message: `Tour ${status}` });
  } catch (err) {
    console.error('Error approving tour:', err);
    res.status(500).json({ message: 'Error approving tour' });
  }
};

exports.getTourReport = async (req, res) => {
  try {
    const { startDate, endDate, empid } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.tour_from_date = { [Op.between]: [startDate, endDate] };
    }
    if (empid) {
      where.empid = empid;
    }
    
    const tours = await TourApplication.findAll({
      where,
      order: [['tour_from_date', 'DESC']]
    });
    
    res.json(tours);
  } catch (err) {
    console.error('Error fetching tour report:', err);
    res.status(500).json({ message: 'Error fetching tour report' });
  }
};

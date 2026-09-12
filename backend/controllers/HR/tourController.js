const { TourApplication, EmployeeMaster, Payslip } = require('../../models');
const { Op, Sequelize } = require('sequelize');

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
    
    // 🛑 Check if payroll is already generated (Find Max Month/Year)
    if (tour_from_date && empid) {
      const [y, m, d] = tour_from_date.split('-').map(Number);
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
            message: `Cannot apply for Tour. Payroll already processed up to ${finalMonthStr} ${latestYearNum}.` 
          });
        }
      }
    }
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

    res.json({ success: true, message: `Tour ${status.toLowerCase()} successfully.` });
  } catch (err) {
    console.error('Error approving tour:', err);
    res.status(500).json({ success: false, message: 'Error approving tour' });
  }
};

exports.cancelTour = async (req, res) => {
  const { tour_id, remarks = "" } = req.body;
  try {
    const app = await TourApplication.findByPk(tour_id);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Cancelled', approval_remark: remarks });
    res.json({ success: true, message: "Tour approval cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error cancelling Tour" });
  }
};

exports.reopenTour = async (req, res) => {
  const { tour_id } = req.body;
  try {
    const app = await TourApplication.findByPk(tour_id);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    await app.update({ status: 'Pending' });
    res.json({ success: true, message: "Tour application reopened" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error reopening Tour" });
  }
};

exports.getTourReport = async (req, res) => {
  try {
    const { startDate, endDate, empid } = req.query;
    const where = {};
    const isValid = (d) => d && !isNaN(Date.parse(d));
    if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
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

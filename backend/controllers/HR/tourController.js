const { TourApplication, EmployeeMaster, Payslip } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const { nextSequenceNumber, LOCK_KEYS } = require('../../utils/docNumber');
const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const isPayrollFinalized = async (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d)) return false;
  const m = MONTH_NAMES[d.getMonth()];
  const y = String(d.getFullYear());
  const cnt = await Payslip.count({ where: { C_MONTH: m, C_YEAR: y, C_FINAL_STATUS: 2 } });
  return cnt > 0;
};

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
    
    if (tour_from_date && await isPayrollFinalized(tour_from_date)) return res.status(400).json({ message: `Payslip finalized for ${tour_from_date.slice(0,7)} — cannot apply Tour.` });
    if (tour_to_date && await isPayrollFinalized(tour_to_date)) return res.status(400).json({ message: `Payslip finalized for ${tour_to_date.slice(0,7)} — cannot apply Tour.` });
    const t = await TourApplication.sequelize.transaction();
    let newTourId;
    try {
      newTourId = await nextSequenceNumber(TourApplication, 'tour_id', t, LOCK_KEYS.TOUR_APPLICATION);
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
    }, { transaction: t });
      await t.commit();
      res.status(201).json({ message: 'Tour application created', data: tour });
    } catch (txErr) { await t.rollback(); throw txErr; }
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
    const ct = tour.tour_from_date;
    if (ct && await isPayrollFinalized(ct)) return res.status(400).json({ message: `Payslip finalized for ${String(ct).slice(0,7)} — cannot update.` });
    if (req.body.tour_from_date && await isPayrollFinalized(req.body.tour_from_date)) return res.status(400).json({ message: `Payslip finalized for ${String(req.body.tour_from_date).slice(0,7)} — cannot update.` });
    if (req.body.tour_to_date && await isPayrollFinalized(req.body.tour_to_date)) return res.status(400).json({ message: `Payslip finalized for ${String(req.body.tour_to_date).slice(0,7)} — cannot update.` });

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
    const ct2 = tour.tour_from_date;
    if (ct2 && await isPayrollFinalized(ct2)) return res.status(400).json({ message: `Payslip finalized for ${String(ct2).slice(0,7)} — cannot delete.` });

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
    const chkT = tour.tour_from_date;
    if (chkT && await isPayrollFinalized(chkT)) return res.status(400).json({ message: `Payslip finalized for ${String(chkT).slice(0,7)} — cannot approve.` });

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
    const cT = app.tour_from_date;
    if (cT && await isPayrollFinalized(cT)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(cT).slice(0,7)} — cannot cancel.` });

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
    const rT = app.tour_from_date;
    if (rT && await isPayrollFinalized(rT)) return res.status(400).json({ success: false, message: `Payslip finalized for ${String(rT).slice(0,7)} — cannot reopen.` });

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

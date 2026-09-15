const express = require('express');
const router = express.Router();
const { requirePermission } = require('../../middleware/auth');
const { HR_PERMISSIONS } = require('../../constants/permissions');
const ctrl = require('../../controllers/HR/trainingController');

router.get('/dashboard', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.getTrainingDashboard);
router.get('/courses', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.getAllCourses);
router.post('/courses', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.saveCourse);
router.get('/sessions', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.getAllSessions);
router.post('/sessions', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.saveSession);
router.get('/participants', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.getParticipants);
router.post('/participants', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.saveParticipants);
router.post('/participants/attendance', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.updateAttendance);
router.get('/certifications', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.getCertifications);
router.post('/certifications', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.saveCertification);
router.delete('/certifications/:id', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.deleteCertification);
router.get('/skills', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.getSkills);
router.post('/skills', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.saveSkill);
router.delete('/skills/:id', requirePermission(HR_PERMISSIONS.TRAINING), ctrl.deleteSkill);

module.exports = router;

const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/HR/trainingController');

router.get('/dashboard', ctrl.getTrainingDashboard);

// Courses
router.get('/courses', ctrl.getAllCourses);
router.post('/courses', ctrl.saveCourse);

// Sessions
router.get('/sessions', ctrl.getAllSessions);
router.post('/sessions', ctrl.saveSession);

// Participants
router.get('/participants', ctrl.getParticipants);
router.post('/participants', ctrl.saveParticipants);
router.post('/participants/attendance', ctrl.updateAttendance);

// Certifications
router.get('/certifications', ctrl.getCertifications);
router.post('/certifications', ctrl.saveCertification);
router.delete('/certifications/:id', ctrl.deleteCertification);

// Skills
router.get('/skills', ctrl.getSkills);
router.post('/skills', ctrl.saveSkill);
router.delete('/skills/:id', ctrl.deleteSkill);

module.exports = router;

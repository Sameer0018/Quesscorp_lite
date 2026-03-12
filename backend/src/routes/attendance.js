const express = require('express');
const router = express.Router();
const controller = require('../controllers/attendanceController');

router.post('/', controller.mark);
router.get('/:employee_id', controller.getByEmployeeId);

module.exports = router;

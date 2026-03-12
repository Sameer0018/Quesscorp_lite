const { Attendance, Employee } = require('../models');
const { validateAttendanceBody } = require('../middleware/validation');

async function mark(req, res, next) {
  try {
    const result = validateAttendanceBody(req.body, Attendance.STATUSES);
    if (!result.valid) return res.status(400).json({ error: 'Validation failed.', code: 'VALIDATION_ERROR', details: result.errors });
    const employee = await Employee.findOne({ id: result.data.employee_id });
    if (!employee) return res.status(404).json({ error: 'Employee not found.', code: 'NOT_FOUND' });
    let attendance = await Attendance.findOne({
      employee_id: result.data.employee_id,
      date: result.data.date,
    });
    if (attendance) {
      attendance.status = result.data.status;
      await attendance.save();
    } else {
      attendance = await Attendance.create(result.data);
    }
    res.status(201).json(attendance.toObject ? attendance.toObject() : attendance);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Attendance for this employee and date already exists.', code: 'CONFLICT' });
    next(e);
  }
}

async function getByEmployeeId(req, res, next) {
  try {
    const employee = await Employee.findOne({ id: req.params.employee_id });
    if (!employee) return res.status(404).json({ error: 'Employee not found.', code: 'NOT_FOUND' });
    const from = req.query.from;
    const to = req.query.to;
    const filter = { employee_id: req.params.employee_id };
    if (from || to) {
      filter.date = {};
      if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) filter.date.$gte = from;
      if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) filter.date.$lte = to;
    }
    const records = await Attendance.find(filter).sort({ date: -1 }).lean();
    res.status(200).json({ data: records });
  } catch (e) {
    next(e);
  }
}

module.exports = { mark, getByEmployeeId };

const { Employee } = require('../models');
const { validateEmployeeBody } = require('../middleware/validation');

async function list(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      Employee.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Employee.countDocuments(),
    ]);
    res.status(200).json({ data: rows, total, page, limit });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const employee = await Employee.findOne({ id: req.params.id }).lean();
    if (!employee) return res.status(404).json({ error: 'Employee not found.', code: 'NOT_FOUND' });
    res.status(200).json(employee);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const result = validateEmployeeBody(req.body);
    if (!result.valid) return res.status(400).json({ error: 'Validation failed.', code: 'VALIDATION_ERROR', details: result.errors });
    const existing = await Employee.findOne({ email: result.data.email });
    if (existing) return res.status(409).json({ error: 'Email already in use.', code: 'EMAIL_EXISTS' });
    const employee = await Employee.create(result.data);
    res.status(201).json(employee.toObject ? employee.toObject() : employee);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Email already in use.', code: 'EMAIL_EXISTS' });
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) return res.status(404).json({ error: 'Employee not found.', code: 'NOT_FOUND' });
    const result = validateEmployeeBody(req.body);
    if (!result.valid) return res.status(400).json({ error: 'Validation failed.', code: 'VALIDATION_ERROR', details: result.errors });
    const existing = await Employee.findOne({ email: result.data.email, id: { $ne: req.params.id } });
    if (existing) return res.status(409).json({ error: 'Email already in use.', code: 'EMAIL_EXISTS' });
    Object.assign(employee, result.data);
    await employee.save();
    res.status(200).json(employee.toObject ? employee.toObject() : employee);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Email already in use.', code: 'EMAIL_EXISTS' });
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const employee = await Employee.findOne({ id: req.params.id });
    if (!employee) return res.status(404).json({ error: 'Employee not found.', code: 'NOT_FOUND' });
    const { Attendance } = require('../models');
    await Attendance.deleteMany({ employee_id: req.params.id });
    await employee.deleteOne();
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getById, create, update, remove };

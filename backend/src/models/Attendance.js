const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUSES = ['Present', 'Absent'];

const schema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true },
    employee_id: { type: String, required: true, ref: 'Employee' },
    date: { type: String, required: true },
    status: { type: String, required: true, enum: STATUSES },
  },
  { timestamps: true }
);

schema.index({ employee_id: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', schema);
Attendance.STATUSES = STATUSES;

module.exports = Attendance;

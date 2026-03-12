const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const schema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4(), unique: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
  },
  { timestamps: true }
);

const Employee = mongoose.model('Employee', schema);
module.exports = Employee;

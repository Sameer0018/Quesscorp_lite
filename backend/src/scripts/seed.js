require('dotenv').config();
const { connect } = require('../config/database');
const { Employee, Attendance } = require('../models');

const sampleEmployees = [
  { full_name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering' },
  { full_name: 'Jane Smith', email: 'jane.smith@company.com', department: 'HR' },
  { full_name: 'Bob Wilson', email: 'bob.wilson@company.com', department: 'Sales' },
];

async function seed() {
  try {
    await connect();
    const count = await Employee.countDocuments();
    if (count > 0) {
      console.log('Database already has data. Skipping seed.');
      process.exit(0);
      return;
    }
    const created = await Employee.insertMany(sampleEmployees);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    for (const emp of created) {
      await Attendance.create({ employee_id: emp.id, date: today, status: 'Present' });
      await Attendance.create({ employee_id: emp.id, date: yesterday, status: 'Present' });
    }
    console.log('Seeded', created.length, 'employees and sample attendance.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();

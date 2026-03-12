// MongoDB does not use SQL migrations. Indexes are defined in Mongoose schemas.
// Run this script to ensure connection and optionally create indexes.
require('dotenv').config();
const { connect } = require('../config/database');
const { Employee, Attendance } = require('../models');

async function run() {
  try {
    await connect();
    await Employee.syncIndexes();
    await Attendance.syncIndexes();
    console.log('MongoDB indexes synced.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

run();

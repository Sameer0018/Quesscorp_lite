const mongoose = require('mongoose');

let databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/hrms_lite';
// Strip angle brackets from URL (e.g. <password> → password); they break MongoDB auth
if (databaseUrl.includes('<') || databaseUrl.includes('>')) {
  databaseUrl = databaseUrl.replace(/<|>/g, '');
}

async function connect() {
  try {
    await mongoose.connect(databaseUrl);
  } catch (err) {
    if (err.message && err.message.includes('bad auth')) {
      console.error('MongoDB auth failed. Check:');
      console.error('  1. Username and password in DATABASE_URL are correct (no < > around password)');
      console.error('  2. If password has @ # : / etc., URL-encode it (e.g. @ → %40)');
      console.error('  3. Atlas → Database Access: user has read/write on your database');
      console.error('  4. Atlas → Network Access: your IP is allowed (or 0.0.0.0/0 for testing)');
    }
    throw err;
  }
}

module.exports = { connect, mongoose };
  
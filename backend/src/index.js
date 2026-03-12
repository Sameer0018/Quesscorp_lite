require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { swaggerUi, spec } = require('./swagger');
const errorHandler = require('./middleware/errorHandler');
const employeesRouter = require('./routes/employees');
const attendanceRouter = require('./routes/attendance');
const { connect } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5178';
const corsOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178'];
 
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
app.use('/api/employees', employeesRouter);
app.use('/api/attendance', attendanceRouter);

app.use(errorHandler);

async function start() {
  try {
    await connect();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger: http://localhost:${PORT}/api-docs`);
    });
  } catch (e) {
    console.error('Failed to start:', e.message);
    process.exit(1);
  }
}

start();

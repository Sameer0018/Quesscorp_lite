const validator = require('validator');

function validateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, message: 'Email is required.' };
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, message: 'Email is required.' };
  if (!validator.isEmail(trimmed)) return { valid: false, message: 'Invalid email format.' };
  return { valid: true, value: trimmed };
}

function validateEmployeeBody(body) {
  const errors = [];
  const full_name = body.full_name != null ? String(body.full_name).trim() : '';
  const department = body.department != null ? String(body.department).trim() : '';
  if (!full_name) errors.push({ field: 'full_name', message: 'Full name is required.' });
  if (!department) errors.push({ field: 'department', message: 'Department is required.' });
  const emailResult = validateEmail(body.email);
  if (!emailResult.valid) errors.push({ field: 'email', message: emailResult.message });
  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { full_name, email: emailResult.value, department } : null,
  };
}

function validateAttendanceBody(body, statuses) {
  const errors = [];
  const employee_id = body.employee_id != null ? String(body.employee_id).trim() : '';
  const date = body.date != null ? String(body.date).trim() : '';
  const status = body.status != null ? String(body.status).trim() : '';
  if (!employee_id) errors.push({ field: 'employee_id', message: 'Employee ID is required.' });
  if (!date) errors.push({ field: 'date', message: 'Date is required.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push({ field: 'date', message: 'Date must be YYYY-MM-DD.' });
  if (!status) errors.push({ field: 'status', message: 'Status is required.' });
  if (status && !statuses.includes(status)) errors.push({ field: 'status', message: "Status must be 'Present' or 'Absent'." });
  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { employee_id, date, status } : null,
  };
}

module.exports = { validateEmail, validateEmployeeBody, validateAttendanceBody };

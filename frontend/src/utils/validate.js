const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  const s = (email || '').trim();
  if (!s) return 'Email is required.';
  if (!EMAIL_REGEX.test(s)) return 'Invalid email format.';
  return null;
}

export function validateRequired(value, name = 'Field') {
  if (value == null || String(value).trim() === '') return `${name} is required.`;
  return null;
}

export function validateEmployee(form) {
  const full_name = (form.full_name || '').trim();
  const email = (form.email || '').trim();
  const department = (form.department || '').trim();
  const errors = {};
  if (!full_name) errors.full_name = 'Full name is required.';
  const e = validateEmail(email);
  if (e) errors.email = e;
  if (!department) errors.department = 'Department is required.';
  return Object.keys(errors).length ? errors : null;
}

export function validateAttendance(form) {
  const errors = {};
  if (!(form.employee_id || '').trim()) errors.employee_id = 'Employee is required.';
  const d = (form.date || '').trim();
  if (!d) errors.date = 'Date is required.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) errors.date = 'Date must be YYYY-MM-DD.';
  if (!['Present', 'Absent'].includes(form.status)) errors.status = "Status must be 'Present' or 'Absent'.";
  return Object.keys(errors).length ? errors : null;
}

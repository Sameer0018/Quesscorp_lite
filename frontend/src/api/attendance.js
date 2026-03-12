import api from './client';

export async function getAttendance(employeeId, params = {}) {
  const { data } = await api.get(`/attendance/${employeeId}`, { params });
  return data;
}

export async function markAttendance(body) {
  const { data } = await api.post('/attendance', body);
  return data;
}

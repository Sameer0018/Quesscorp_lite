import api from './client';

export async function getEmployees(params = {}) {
  const { data } = await api.get('/employees', { params });
  return data;
}

export async function getEmployee(id) {
  const { data } = await api.get(`/employees/${id}`);
  return data;
}

export async function createEmployee(body) {
  const { data } = await api.post('/employees', body);
  return data;
}

export async function updateEmployee(id, body) {
  const { data } = await api.put(`/employees/${id}`, body);
  return data;
}

export async function deleteEmployee(id) {
  await api.delete(`/employees/${id}`);
}

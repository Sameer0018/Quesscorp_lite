import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEmployee } from '../api/employees';
import { getAttendance } from '../api/attendance';
import { Layout } from '../components/Layout';
import { Table } from '../components/Table';

export function AttendanceByEmployee() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    Promise.all([getEmployee(employeeId), getAttendance(employeeId)])
      .then(([emp, res]) => {
        setEmployee(emp);
        setRecords(res.data || []);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-4">
        <Link to="/" className="text-indigo-600 hover:underline">← Employees</Link>
      </div>
      {loading && <div className="text-slate-500">Loading...</div>}
      {error && <div className="rounded-lg bg-red-50 text-red-700 p-4 mb-4">{error}</div>}
      {!loading && employee && (
        <>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Attendance: {employee.full_name}</h1>
          <p className="text-slate-600 mb-6">{employee.email} · {employee.department}</p>
          <Table columns={columns} data={records} emptyMessage="No attendance records yet." keyField="id" />
        </>
      )}
    </Layout>
  );
}

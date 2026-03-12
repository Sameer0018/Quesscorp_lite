import { useState, useEffect } from 'react';
import { getEmployees } from '../api/employees';
import { getAttendance, markAttendance } from '../api/attendance';
import { useToast } from '../context/ToastContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Table } from '../components/Table';
import { validateAttendance } from '../utils/validate';

const today = new Date().toISOString().slice(0, 10);

export function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee_id: '', date: today, status: 'Present' });
  const [records, setRecords] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    getEmployees({ limit: 500 })
      .then((r) => setEmployees(r.data || []))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoadingEmployees(false));
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setRecords([]);
      return;
    }
    setLoadingRecords(true);
    getAttendance(selectedEmployeeId)
      .then((r) => setRecords(r.data || []))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoadingRecords(false));
  }, [selectedEmployeeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateAttendance(form);
    if (err) {
      setErrors(err);
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      await markAttendance(form);
      toast.success('Attendance marked.');
      setForm((f) => ({ ...f, date: today, status: 'Present' }));
      if (form.employee_id === selectedEmployeeId) {
        getAttendance(form.employee_id).then((r) => setRecords(r.data || []));
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const employeeOptions = employees.map((e) => ({ value: e.id, label: `${e.full_name} (${e.department})` }));
  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Attendance</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Mark attendance</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Employee"
              name="employee_id"
              options={employeeOptions}
              value={form.employee_id}
              onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
              error={errors.employee_id}
            />
            <Input
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              error={errors.date}
            />
            <Select
              label="Status"
              name="status"
              options={[{ value: 'Present', label: 'Present' }, { value: 'Absent', label: 'Absent' }]}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              error={errors.status}
            />
            <Button type="submit" disabled={saving || loadingEmployees}>
              {saving ? 'Saving...' : 'Mark attendance'}
            </Button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">View by employee</h2>
          <Select
            label="Employee"
            options={[{ value: '', label: 'Select employee...' }, ...employeeOptions]}
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
          />
          {loadingRecords && <p className="mt-2 text-slate-500">Loading...</p>}
          {!loadingRecords && selectedEmployeeId && (
            <div className="mt-4">
              <Table columns={columns} data={records} emptyMessage="No attendance records." keyField="id" />
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

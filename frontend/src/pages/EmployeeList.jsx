import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../api/employees';
import { useToast } from '../context/ToastContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Table } from '../components/Table';
import { Modal } from '../components/Modal';

export function EmployeeList() {
  const [data, setData] = useState({ data: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployees({ page: data.page, limit: data.limit });
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [data.page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteId);
      toast.success('Employee deleted.');
      setDeleteId(null);
      fetchEmployees();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Link to={`/employees/${row.id}/edit`}>
            <Button variant="secondary" className="!py-1 !px-2 text-xs">Edit</Button>
          </Link>
          <Link to={`/attendance/${row.id}`}>
            <Button variant="secondary" className="!py-1 !px-2 text-xs">Attendance</Button>
          </Link>
          <Button variant="danger" className="!py-1 !px-2 text-xs" onClick={() => setDeleteId(row.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
        <Link to="/employees/new">
          <Button>Add Employee</Button>
        </Link>
      </div>

      {loading && <div className="text-slate-500">Loading...</div>}
      {error && <div className="rounded-lg bg-red-50 text-red-700 p-4 mb-4">{error}</div>}
      {!loading && !error && (
        <Table columns={columns} data={data.data} emptyMessage="No employees yet. Add one to get started." keyField="id" />
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete employee">
        <p className="text-slate-600 mb-4">Are you sure you want to delete this employee? This will also remove their attendance records.</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete'}</Button>
        </div>
      </Modal>
    </Layout>
  );
}

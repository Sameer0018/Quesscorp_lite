import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployee, createEmployee, updateEmployee } from '../api/employees';
import { useToast } from '../context/ToastContext';
import { Layout } from '../components/Layout';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { validateEmployee } from '../utils/validate';

export function EmployeeForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ full_name: '', email: '', department: '' });

  useEffect(() => {
    if (isEdit) {
      getEmployee(id)
        .then(setForm)
        .catch(() => toast.error('Failed to load employee'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmployee(form);
    if (err) {
      setErrors(err);
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await updateEmployee(id, form);
        toast.success('Employee updated.');
      } else {
        await createEmployee(form);
        toast.success('Employee added.');
      }
      navigate('/');
    } catch (e) {
      toast.error(e.message);
      if (e.message && e.message.toLowerCase().includes('email')) setErrors((prev) => ({ ...prev, email: e.message }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="text-slate-500">Loading...</div></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <Input
          label="Full name"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          error={errors.full_name}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled={isEdit}
        />
        <Input
          label="Department"
          name="department"
          value={form.department}
          onChange={handleChange}
          error={errors.department}
          required
        />
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Add'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
        </div>
      </form>
    </Layout>
  );
}

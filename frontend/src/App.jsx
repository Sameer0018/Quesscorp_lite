import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { EmployeeList } from './pages/EmployeeList';
import { EmployeeForm } from './pages/EmployeeForm';
import { AttendancePage } from './pages/AttendancePage';
import { AttendanceByEmployee } from './pages/AttendanceByEmployee';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/attendance/:employeeId" element={<AttendanceByEmployee />} />
      </Routes>
    </ToastProvider>
  );
}

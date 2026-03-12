import { Link, useLocation } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Employees' },
  { to: '/attendance', label: 'Attendance' },
];

export function Layout({ children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
<Link to="/" className="flex items-center">
  <img
    src="https://www.quesscorp.com/wp-content/uploads/2022/11/quessbluesvg.svg"
    alt="Quess Logo"
    className="h-10 w-auto"
  />
</Link>          <nav className="flex gap-6">
            {nav.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`font-medium ${
                  location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}

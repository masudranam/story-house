import { NavLink, Outlet } from 'react-router-dom';

const linkClass =
  'px-5 py-3 text-sm font-medium rounded-t-lg transition-all duration-200 hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300';
const active = 'bg-gray-50 text-blue-600 border-b-2 border-blue-600';
const inactive = 'text-gray-600 border-b-2 border-transparent';

const Settings = () => (
  <div className="max-w-lg mx-auto mt-0 p-6 bg-white rounded-2xl shadow-lg">
    <h1 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h1>
    <div className="flex border-b border-gray-200 mb-6">
      <NavLink
        end
        to="."
        className={({ isActive }) => `${linkClass} ${isActive ? active : inactive}`}
      >
        User Info
      </NavLink>
      <NavLink
        to="security"
        className={({ isActive }) => `${linkClass} ${isActive ? active : inactive}`}
      >
        Security
      </NavLink>
    </div>
    <div className="bg-gray-50 p-6 rounded-lg">
      <Outlet />
    </div>
  </div>
);

export default Settings;
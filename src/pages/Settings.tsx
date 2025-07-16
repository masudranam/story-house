import { NavLink, Outlet } from 'react-router-dom';

const linkClass =
  'px-5 py-2 text-sm font-medium transition-all duration-200 rounded-full focus:outline-none';
const active = 'bg-blue-600 text-white shadow';
const inactive = 'bg-gray-100 text-gray-600 hover:bg-gray-200';

const Settings = () => (
  <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg">
    <h1 className="text-2xl font-semibold text-center text-gray-800 mb-8">Settings</h1>

    <div className="flex justify-center gap-4 mb-6">
      <NavLink
        end
        to="."
        className={({ isActive }) =>
          `${linkClass} ${isActive ? active : inactive}`
        }
      >
        User Info
      </NavLink>
      <NavLink
        to="security"
        className={({ isActive }) =>
          `${linkClass} ${isActive ? active : inactive}`
        }
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

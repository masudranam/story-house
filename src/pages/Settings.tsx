// src/pages/Settings.tsx
import { NavLink, Outlet } from 'react-router-dom';

const linkClass =
  'px-4 py-2 rounded-t-md border-b-2 -mb-px transition hover:bg-gray-100';
const active = 'border-blue-600 text-blue-600';
const inactive = 'border-transparent text-gray-600';

const Settings = () => (
  <div className="max-w-3xl mx-auto mt-8 bg-white shadow rounded">
    <div className="border-b flex">
      <NavLink end to="."          className={({isActive}) => `${linkClass} ${isActive?active:inactive}`}>User Info</NavLink>
      <NavLink to="security"       className={({isActive}) => `${linkClass} ${isActive?active:inactive}`}>Security</NavLink>
    </div>
    <div className="p-6">
      <Outlet />
    </div>
  </div>
);

export default Settings;

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageCircle,
  Settings,
} from 'lucide-react';

export default function AdminMenu() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 focus:ring-2 focus:ring-blue-300 ${
      isActive ? 'bg-blue-50 text-blue-600 font-semibold' : ''
    }`;

  return (
    <nav className="w-full border-b border-gray-200 bg-white shadow-sm caret-transparent">
      <div className="mx-auto flex flex-wrap gap-3 p-4 max-w-4xl">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/users" className={linkClass}>
          <Users size={18} />
          <span>Users</span>
        </NavLink>

        <NavLink to="/admin/posts" className={linkClass}>
          <FileText size={18} />
          <span>Posts</span>
        </NavLink>

        <NavLink to="/admin/comments" className={linkClass}>
          <MessageCircle size={18} />
          <span>Comments</span>
        </NavLink>

        <NavLink to="/admin/settings" className={linkClass}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
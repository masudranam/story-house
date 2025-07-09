// src/components/AdminMenu.tsx
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
    `inline-flex items-center gap-1 px-4 py-2 rounded-md transition
     ${isActive ? 'bg-gray-300 font-semibold' : 'hover:bg-gray-200'}`;

  return (
    <nav className="w-full border-b">
      <div className="mx-auto flex flex-wrap gap-2 p-3 max-w-6xl">
        

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

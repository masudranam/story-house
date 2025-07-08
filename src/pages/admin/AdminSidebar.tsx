import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  MessageCircle,
  Settings,
} from 'lucide-react';

export default function AdminSidebar({ open }: { open: boolean }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-600 transition ${
      isActive ? 'bg-blue-700 font-semibold' : ''
    }`;

  return (
    <aside className={`bg-blue-800 text-white h-full p-4 ${open ? 'block' : 'hidden'} md:block`}>
      <h2 className="text-2xl font-bold mb-4">Admin</h2>

      <NavLink to="/" className={linkClass}>
        <Home size={18} /> {open && 'Home'}
      </NavLink>

      <nav className="space-y-2">
        <NavLink to="/admin/dashboard" className={linkClass}>
          <LayoutDashboard size={18} /> {open && 'Dashboard'}
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          <Users size={18} /> {open && 'Users'}
        </NavLink>
        <NavLink to="/admin/posts" className={linkClass}>
          <FileText size={18} /> {open && 'Posts'}
        </NavLink>
        <NavLink to="/admin/comments" className={linkClass}>
          <MessageCircle size={18} /> {open && 'Comments'}
        </NavLink>
        <NavLink to="/admin/settings" className={linkClass}>
          <Settings size={18} /> {open && 'Settings'}
        </NavLink>
      </nav>
    </aside>
  );
}

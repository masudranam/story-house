import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from '../pages/admin/AdminSidebar';

export default function AdminLayout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${open ? 'w-60' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <AdminSidebar open={open} />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 relative">
        <button
          onClick={() => setOpen(!open)}
          className="absolute top-4 left-4 z-50 bg-blue-700 text-white p-2 rounded-md hover:bg-blue-800"
        >
          <Menu size={20} />
        </button>
        <div className="pt-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

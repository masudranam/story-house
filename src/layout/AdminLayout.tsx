import { Outlet } from 'react-router-dom';
import AdminTopMenu from '../pages/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopMenu />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}

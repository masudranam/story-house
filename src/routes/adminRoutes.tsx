import { Route } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import Dashboard from '../pages/admin/DashBoard';
import Users from '../pages/admin/Users';
import Posts from '../pages/admin/Posts';
import Comments from '../pages/admin/Comments';
import SettingsRoutes from './settingsRoutes';

const AdminRoutes = () => (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="posts" element={<Posts />} />
    <Route path="comments" element={<Comments />} />
    {SettingsRoutes().props.children}
  </Route>
);

export default AdminRoutes;

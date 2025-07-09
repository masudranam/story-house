import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import PublicRoutes from './publicRoutes';
import SettingsRoutes from './settingsRoutes';
import AdminRoutes from './adminRoutes';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Layout />}>
      {PublicRoutes().props.children}
      {SettingsRoutes().props}
    </Route>
    {AdminRoutes()}
  </Routes>
);

export default AppRoutes;

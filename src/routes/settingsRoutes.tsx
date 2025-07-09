import { Route } from 'react-router-dom';
import Settings from '../pages/Settings';
import UserInfo from '../pages/settings/UserInfo';
import Security from '../pages/settings/Security';

const SettingsRoutes = () => (
  <Route path="settings" element={<Settings />}>
    <Route index element={<UserInfo />} />
    <Route path="security" element={<Security />} />
  </Route>
);

export default SettingsRoutes;

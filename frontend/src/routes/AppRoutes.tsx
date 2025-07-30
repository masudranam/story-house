import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AddPost from '../pages/AddPost';
import Profile from '../pages/ProfilePage';
import PostDetail from '../pages/postDetails';
import EditPost from '../pages/EditPost';
import Settings from '../pages/Settings';
import UserInfo from '../pages/settings/UserInfo';
import Security from '../pages/settings/Security';
import Dashboard from '../pages/admin/DashBoard';
import AdminLayout from '../layout/AdminLayout';
import Users from '../pages/admin/Users';
import Posts from '../pages/admin/Posts';
import Comments from '../pages/admin/Comments';
import About from '../pages/About';
import NotFound from '../components/NotFound';
import PrivateRoute from './PrivateRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="stories/:id" element={<PostDetail />} />
        <Route path="users/login" element={<Login />} />
        <Route path="users/signup" element={<Signup />} />
        <Route path="about" element={<About />} />

        
        <Route path="posts/create" element={
          <PrivateRoute><AddPost /></PrivateRoute>
        } />
 
        <Route path="profile" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
        <Route path="profile/:userId" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
 
        <Route path="posts/:id/edit" element={
          <PrivateRoute><EditPost /></PrivateRoute>
        } />

       
        <Route path="users/settings" element={
          <PrivateRoute><Settings /></PrivateRoute>
        }>
          <Route index element={<UserInfo />} />
          <Route path="security" element={<Security />} />
        </Route>

      
        <Route path="/admin" element={
          <PrivateRoute><AdminLayout /></PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<Posts />} />
          <Route path="comments" element={<Comments />} />
          <Route path="settings" element={<Settings />} >
            <Route index element={<UserInfo />} />
            <Route path="info" element={<UserInfo />} />
            <Route path="security" element={<Security />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />

    </Routes>

  );
};

export default AppRoutes;

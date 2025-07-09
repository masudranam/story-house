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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="stories/:id" element={<PostDetail />} />
        <Route path="add-post" element={<AddPost />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/:userId" element={<Profile />} />
        <Route path="edit-post/:id" element={<EditPost />} />

        <Route path="settings" element={<Settings />}>
          <Route index element={<UserInfo />} />
          <Route path="security" element={<Security />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />} >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="posts" element={<Posts />} />
          <Route path="comments" element={<Comments />} />
          <Route path="settings" element={<Settings />}>
            <Route index element={<UserInfo />} />
            <Route path="info" element={<UserInfo />} />
            <Route path="security" element={<Security />} />
          </Route>
          
        </Route>
      </Route>


    </Routes>

  );
};

export default AppRoutes;

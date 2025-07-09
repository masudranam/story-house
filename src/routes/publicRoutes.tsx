import { Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AddPost from '../pages/AddPost';
import Profile from '../pages/ProfilePage';
import PostDetail from '../pages/postDetails';
import EditPost from '../pages/EditPost';

const PublicRoutes = () => (
  <>
    <Route index element={<Home />} />
    <Route path="stories/:id" element={<PostDetail />} />
    <Route path="add-post" element={<AddPost />} />
    <Route path="login" element={<Login />} />
    <Route path="signup" element={<Signup />} />
    <Route path="profile" element={<Profile />} />
    <Route path="profile/:userId" element={<Profile />} />
    <Route path="edit-post/:id" element={<EditPost />} />
  </>
);

export default PublicRoutes;

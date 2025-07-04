import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import AddPost from '../pages/AddPost';
import Profile from '../pages/ProfilePage';
import PostDetail from '../pages/postDetails';

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="stories/:id" element={<PostDetail />} />
        <Route path="add-post" element={<AddPost />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Routes without Navbar */}

    </Routes>
  );
};

export default AppRoutes;

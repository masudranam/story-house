import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import PostCard from '../components/PostCard'; 

interface Post {
  id: number;
  title: string;
  description: string;
  author: string;
  date: string;
}

const Profile = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
   
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Assuming token payload has username, otherwise fetch user profile
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload.userId || 'User');
    } catch {
      setUsername('User');
    }

    // Fetch user posts from API (example)
    const fetchPosts = async () => {
      try {
        const res = await API.get('/stories/myposts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch {
        setPosts([]);
      }
    };

    fetchPosts();
  }, [navigate]);

  

  const handleAddPost = () => {
    navigate('/add-post');
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome, {username}</h1>
         
      </div>

      <button
        onClick={handleAddPost}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add New Post
      </button>

      <div className="space-y-6">
        {posts.length === 0 && <p>No posts yet.</p>}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            title={post.title}
            description={post.description}
            author={post.author}
            date={post.date}
          />
        ))}
      </div>
    </div>
  );
};

export default Profile;

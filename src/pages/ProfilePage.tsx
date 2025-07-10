import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import PostCard from '../components/PostCard';
import type { Post } from '../dtos/post.dto';
import { useUser } from '../context/UserContext';

const POSTS_PER_PAGE = 8;

const Profile = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [username, setUsername] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useUser();
  const { userId } = useParams();

  const isOwnProfile = !userId || userId === user?.userId;

  useEffect(() => {
   if(user === null)return;
    if (!user) {
      navigate('/login');
      return;
    }
   
    if (isOwnProfile) {
      setUsername(user?.username ?? 'User');
    }
  },[user,userId]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const idToFetch = userId || user?.userId;

        const res = await API.get('/stories', {
          params: {
            authorId: idToFetch,
            page: currentPage,
            limit: POSTS_PER_PAGE,
            title: search || undefined,
          },
        });

        setPosts(res.data.rows);
        setTotalPages(Math.ceil(res.data.count / POSTS_PER_PAGE));

        if (!isOwnProfile && res.data.rows.length > 0) {
          setUsername(res.data.rows[0].author.name);
        }
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (user || userId) fetchPosts();
  }, [user, userId, currentPage, search]);

  const handleAddPost = () => navigate('/add-post');
  const handleEdit = (id: string) => navigate(`/edit-post/${id}`);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/stories/${id}`);
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 ">
      <div className="flex items-center justify-between mb-6 caret-transparent">
        <h1 className="text-2xl font-bold">
          {isOwnProfile ? 'Welcome, ' : 'Posts by '}
          {username}
        </h1>
      </div>

      {isOwnProfile && (
        <button
          onClick={handleAddPost}
          className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add New Post
        </button>
      )}

      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setCurrentPage(1); // reset to first page on new search
        }}
        className="mb-6 w-full max-w-md px-4 py-2 border rounded border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              {...post}
              onDelete={
                isOwnProfile || user?.role === 1 ? handleDelete : undefined
              }
              onEdit={isOwnProfile ? handleEdit : undefined}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;

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
    if (user === null) return;
    if (!user) {
      navigate('/login');
      return;
    }

    if (isOwnProfile) {
      setUsername(user?.username ?? 'User');
    }
  }, [user, userId]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 caret-transparent">
        {/* User Information Sidebar */}
        <div className="lg:w-1/4 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{username}</h2>
              <p className="text-sm text-gray-500">
                {isOwnProfile ? 'Your Profile' : 'User Profile'}
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Posts: {posts.length}</p>
            <p className="text-sm text-gray-600">
              Joined: {'N/A'}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/settings')}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isOwnProfile ? 'Your Posts' : `Posts by ${username}`}
            </h1>
          </div>

          {isOwnProfile && (
            <button
              onClick={handleAddPost}
              className="mb-6 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
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
              setCurrentPage(1);
            }}
            className="mb-6 w-full sm:w-80 px-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
          />

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {loading ? (
              <p className="text-gray-500 col-span-full text-center">Loading...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">No posts found.</p>
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
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Prev
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import type { Post } from '../dtos/post.dto';

const POSTS_PER_PAGE = 8;

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
 
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/stories', {
        params: {
          page: currentPage,
          limit: POSTS_PER_PAGE,
          sort: sortAsc ? 'asc' : 'desc',
          title: search || undefined,
        },
      });
      setPosts(res.data.rows);
      setTotalPages(Math.ceil(res.data.count / POSTS_PER_PAGE));
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortAsc, search]);

  const handleEdit = (id: string) => {
    navigate(`/edit-post/${id}`);
  };

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await API.delete(`/stories/${id}`);
        fetchPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Latest Posts</h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-80 px-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
        />
        <button
          onClick={() => {
            setSortAsc(!sortAsc);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          Sort: {sortAsc ? 'Oldest' : 'Newest'}
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <p className="text-gray-500 col-span-full text-center">Loading...</p>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              {...post}
              onDelete={
                user?.userId === post.authorId || user?.role === 1
                  ? handleDelete
                  : undefined
              }
              onEdit={
                user?.userId === post.authorId ? handleEdit : undefined
              }
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No posts found.</p>
        )}
      </div>

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
    </div>
  );
};

export default Home;
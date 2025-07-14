import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import API from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
 
import type { Post } from '../dtos/post.dto';
import { useAuth } from '../context/AuthContext';

const POSTS_PER_PAGE = 8;

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

 
  const { user } = useAuth();
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

 
  useEffect(()=>{
    setCurrentPage(1);
  },[search]);

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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Latest Posts</h2>

      
      <button
        onClick={() => {
          setSortAsc(!sortAsc);
          setCurrentPage(1);
        }}
        className="px-4 py-1 border rounded-4xl border-gray-300 focus:outline-none focus:ring-2 ml-2"
      >
        Sort: {sortAsc ? 'Oldest' : 'Newest'}
      </button>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <p>Loading...</p>
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
              likesCount={1}
              commentsCount={5}
            />
          ))
        ) : (
          <p className="text-gray-600 col-span-full">No posts found.</p>
        )}
      </div>

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
    </div>
  );
};

export default Home;

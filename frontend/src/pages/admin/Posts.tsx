import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import PostCard from '../../components/PostCard';
import type { Post } from '../../dtos/post.dto';
import { useAuth } from '../../context/AuthContext';
import { Loader } from 'lucide-react';
import Pagination from '../../components/Pagination';
import DeleteConfirmPopup from '../../components/DeleteConfirmPopup';

const POSTS_PER_PAGE = 6;

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/stories', {
        params: {
          page,
          limit: POSTS_PER_PAGE,
          search,
          sort: sort === 'newest' ? 'desc' : 'asc',
        },
      });
      setPosts(res.data.rows);
      setTotal(res.data.count);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    fetchPosts();
  }, [page, search, sort]);

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await API.delete(`/stories/${id}`);
      setShowDeleteConfirm(null);
      fetchPosts();
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      setShowDeleteConfirm(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/posts/${id}/edit`);
  };

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg caret-transparent">


    
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Posts</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
          className="w-full sm:w-40 px-3 py-2.5 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 text-sm font-medium text-gray-600"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

     
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

     
      {loading ? (
        <Loader />
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-600 py-6">No posts found.</div>
      ) : (
        <>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                onEdit={user?.userId === post.authorId ? () => handleEdit(post.id) : undefined}
                onDelete={
                  user?.userId === post.authorId || user?.role === 1
                    ? () => setShowDeleteConfirm(post.id)
                    : undefined
                }
              />
            ))}
          </div>


          {totalPages > 1 && (
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          )}
        </>
      )}


      {showDeleteConfirm && (
        <DeleteConfirmPopup
          onConfirm={() => handleDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          loading={deleteLoading}
          className='fixed top-40 right-160 z-50'
        />
      )}
      
    </div>
  );
}
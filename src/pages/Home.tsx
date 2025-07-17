import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import API from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { Post } from '../dtos/post.dto';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmPopup from '../components/DeleteConfirmPopup';
import Pagination from '../components/Pagination';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const POSTS_PER_PAGE = 8;

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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


  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, sortAsc, search]);

  const handleEdit = (id: string) => {
    navigate(`/posts/${id}/edit`);
  };

  const confirmDelete = (id: string) => {
    setShowDeleteConfirmId(id);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await API.delete(`/stories/${id}`);
      fetchPosts();
      toast.success('Post has been deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirmId(null);
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text caret-transparent">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Dashboard</h2>


      <button
        onClick={() => {
          setSortAsc(!sortAsc);
          setCurrentPage(1);
        }}
        className="px-4 py-1 border rounded-4xl border-gray-300 focus:outline-none focus:ring-2 ml-2 mb-1"
      >
        Sort: {sortAsc ? 'Oldest' : 'Newest'}
      </button>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <Loader />
        ) : posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              {...post}
              onDelete={
                user?.userId === post.authorId || user?.role === 1
                  ? confirmDelete
                  : undefined
              }
              onEdit={
                user?.userId === post.authorId ? handleEdit : undefined
              }
            />
          ))
        ) : (
          <p className="text-gray-600 col-span-full">No posts found.</p>
        )}
      </div>

      {showDeleteConfirmId && (
        <DeleteConfirmPopup
          onConfirm={() => handleDelete(showDeleteConfirmId)}
          onCancel={() => setShowDeleteConfirmId(null)}
          loading={deleteLoading}
          className='fixed top-20 right-160 z-50'
        />
      )}

      <Pagination
        page={currentPage}
        setPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};

export default Home;

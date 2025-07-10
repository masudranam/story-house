import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import PostCard from '../../components/PostCard';
import { useUser } from '../../context/UserContext';
import type { Post } from '../../dtos/post.dto';

const POSTS_PER_PAGE = 6;

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
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
      console.error('Failed to fetch posts', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [page, search, sort]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/stories/${id}`);
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit-post/${id}`);
  };

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Posts</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded w-full sm:w-1/2"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
        </select>
      </div>

      {loading ? (
        <div>Loading posts...</div>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                onEdit={user?.userId === post.authorId ? handleEdit : undefined}
                onDelete={user?.userId === post.authorId || user?.role === 1 ? handleDelete : undefined}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

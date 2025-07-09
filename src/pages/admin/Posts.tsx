import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
}

const POSTS_PER_PAGE = 6;

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/stories`);
      setPosts(res.data.stories);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.author.name.toLowerCase().includes(search.toLowerCase()) ||
        p.author.username.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const visiblePosts = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

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
      ) : filteredPosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {visiblePosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/stories/${post.id}`)}
                className="relative cursor-pointer bg-white border rounded-lg shadow p-4 hover:shadow-lg transition group"
              >
                <h3 className="text-lg font-semibold text-blue-800 mb-2">{post.title}</h3>
                <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${post.author.id}`);
                    }}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {post.author.name}
                  </span>

                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(post.id);
                    }}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
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

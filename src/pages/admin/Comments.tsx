import { useEffect, useState } from 'react';
import API from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  storyId: string;
  author: {
    id: string;
    username: string;
  };
}

const COMMENTS_PER_PAGE = 6;

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/comments', {
        params: {
          content: search,
          author: search,
          page,
          limit: COMMENTS_PER_PAGE,
        },
      });

      setComments(res.data.rows);
      setTotal(res.data.count);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [page, search]);

  const totalPages = Math.ceil(total / COMMENTS_PER_PAGE);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${id}`);
      fetchComments();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Moderate Comments</h1>

      <input
        type="text"
        placeholder="Search by content or username..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-6 px-4 py-2 border rounded w-full max-w-md"
      />

      {loading ? (
        <div>Loading comments...</div>
      ) : comments.length === 0 ? (
        <p>No comments found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-white border rounded-lg shadow p-4 hover:shadow-md cursor-pointer relative"
                onClick={() =>
                  navigate(`/stories/${c.storyId}`, { state: { scrollToComment: true } })
                }
              >
                <p className="text-sm text-gray-800 font-medium mb-1">@{c.author.username}</p>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {c.content.length > 100 ? c.content.slice(0, 50) + '...' : c.content}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {new Date(c.createdAt).toLocaleString()}
                </p>

                <div className="absolute top-2 right-2 space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c.id);
                    }}
                    className="text-xs text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm text-gray-700">
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

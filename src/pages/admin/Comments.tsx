import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';

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
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
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
      setError('Failed to load comments. Please try again.');
      toast.error('Failed to load comments.');
      console.error('Failed to fetch comments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await API.delete(`/comments/${id}`);
      setDeleteConfirmId(null);
      fetchComments();
      toast.success('Comment deleted successfully!');
    } catch (err) {
      setError('Failed to delete comment. Please try again.');
      toast.error('Failed to delete comment.');
      setDeleteConfirmId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages = Math.ceil(total / COMMENTS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Moderate Comments</h1>
 
      <input
        type="text"
        placeholder="Search by content or username..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="w-full max-w-md px-4 py-2.5 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 bg-gray-50 mb-6"
      />

     
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

  
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center text-gray-600 py-6">No comments found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-gray-50 border border-gray-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200 cursor-pointer relative"
                onClick={() =>
                  deleteConfirmId !== c.id &&
                  navigate(`/stories/${c.storyId}`, { state: { scrollToComment: true } })
                }
              >
                <p className="text-sm font-medium text-blue-600 hover:underline mb-1">
                  @{c.author.username}
                </p>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {c.content}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(c.createdAt).toLocaleString( )}
                </p>
                {deleteConfirmId === c.id ? (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                      disabled={deleteLoading}
                      className="text-sm text-white bg-red-500 px-3 py-1 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 flex items-center"
                    >
                      {deleteLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Deleting
                        </span>
                      ) : (
                        'Confirm'
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(null);
                      }}
                      className="text-sm text-gray-600 bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(c.id);
                    }}
                    className="absolute top-2 right-2 text-sm text-red-600 hover:text-red-700 transition-all duration-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>

           
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium text-sm disabled:opacity-50"
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
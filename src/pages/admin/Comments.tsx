import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '../../components/DeleteConfirmation';
import type { Comment } from '../../dtos/comment.dto';
import Pagination from '../../components/Pagination';
import { Loader } from 'lucide-react';
 

const COMMENTS_PER_PAGE = 6;

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

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
      toast.error('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    setPage(1);
  },[search])
  
  useEffect(() => {
    fetchComments();
  }, [search,page]);

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
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg caret-transparent">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Moderate Comments</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

  
      {loading ? (
        <Loader />
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
                  {c.author.username}
                </p>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {c.content}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(c.createdAt).toLocaleString( )}
                </p>
                {deleteConfirmId === c.id ? (
                  <DeleteConfirmModal
                    onConfirm={() => handleDelete(c.id)}
                    onCancel={() => setDeleteConfirmId(null)}
                    loading={deleteLoading}
                    className='flex absolute top-2 right-3 space-x-1'
                  />
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

         <Pagination
          page={page}
          setPage={setPage}
          totalPages={totalPages}
         />
        </>
      )}
    </div>
  );
}
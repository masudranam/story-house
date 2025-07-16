import { useEffect, useState } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { Comment } from '../dtos/comment.dto';
import Pagination from './Pagination';
import DeleteConfirmModal from './DeleteConfirmation';

interface CommentsSectionProps {
  storyId: string;
  userId: string;
}

const PER_PAGE = 6;

const CommentsSection = ({ storyId, userId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments`, {
        params: { storyId, page, limit: PER_PAGE },
      });
      setComments(res.data.rows);
      setTotal(res.data.count);
    } catch {
      toast.error('Failed to load comments');
    }
  };

  useEffect(() => {
    fetchComments();
  }, [storyId, page]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      await API.post(`/comments/${storyId}`, { content: newComment.trim() });
      setNewComment('');
      setPage(1);
      fetchComments();
      toast.success('Comment posted successfully');
    } catch {
      toast.error('Failed to post comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    if(!confirm('Confirm delete'))return;
    try {
      await API.delete(`/comments/${commentId}`);
      fetchComments();
      toast.success('Comment deleted succesfully');
    } catch {
      toast.error('Failed to delete');
    }finally{
      setDeleteConfirmId(null);

    }
  };

  const handleSaveEdit = async (commentId: string) => {
    try {
      await API.put(`/comments/${commentId}`, { content: editedContent.trim() });
      setEditingId(null);
      setEditedContent('');
      fetchComments();
      toast.success('Comment successfully updated');
    } catch {
      toast.error('Failed to udpate comments');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-start gap-2 mb-4">
        <Link
          to={`/profile`}
          className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold hover:bg-blue-700"
          title="you"
        >
          {user?.username.charAt(0)}
        </Link>
        <input
          className="flex-grow border rounded-full px-4 py-2 bg-gray-100 focus:outline-none"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <Link
              to={`/profile/${c.author.id}`}
              className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold hover:bg-blue-700"
              title={c.author.name}
            >
              {c.author.name.charAt(0)}
            </Link>

            <div className="bg-gray-100 px-4 py-2 rounded-xl w-full">
              {editingId === c.id ? (
                <textarea
                  className="w-full border rounded p-1 text-sm"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
              ) : (
                <p className="text-sm">{c.content}</p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                {new Date(c.createdAt).toLocaleTimeString()}
              </p>

              {c.userId === userId && (
                <div className="text-xs space-x-3 mt-2">
                  {editingId === c.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(c.id)} className="text-blue-600">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(c.id); setEditedContent(c.content); }} className="text-blue-600">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600">Delete</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />

      {deleteConfirmId && (
        <DeleteConfirmModal
          loading={deleteLoading}
          onConfirm={() => handleDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
};

export default CommentsSection;

import { useEffect, useState } from 'react';
import API from '../services/api';

interface Comment {
    id: string;
    storyId: string;
    userId: string;
    content: string;
    createdAt: string;
}

interface CommentsSectionProps {
    storyId: string;
    userId: string;
}

const PER_PAGE = 5;

const CommentsSection = ({ storyId, userId }: CommentsSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [page, setPage] = useState(1);

   
    const fetchComments = async () => {
        try {
            const { data } = await API.get(`/comments?storyId=${storyId}`);
            setComments(data);
        } catch {
            console.error('Failed to load comments');
        }
    };

    useEffect(() => {
        fetchComments();
    }, [storyId]);

    
    const totalPages = Math.ceil(comments.length / PER_PAGE);
    const visible = comments.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        try {
            await API.post(`/comments/${storyId}`, { content: newComment.trim() });
            setNewComment('');
            await fetchComments();
            setPage(1);  
        } catch {
            alert('Failed to post comment');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        try {
            await API.delete(`/comments/${commentId}`);
            await fetchComments();
        } catch {
            alert('Failed to delete');
        }
    };

    const handleSaveEdit = async (commentId: string) => {
        try {
            await API.put(`/comments/${commentId}`, { content: editedContent.trim() });
            setEditingId(null);
            setEditedContent('');
            await fetchComments();
        } catch {
            alert('Failed to update');
        }
    };

    return (
        <div className="mt-6">
             
            <div className="flex items-start gap-2 mb-4">
                <button
                    className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold"
                    title="you"
                >
                    {userId.charAt(0).toUpperCase()}
                </button>
                <input
                    className="flex-grow border rounded-full px-4 py-2 bg-gray-100 focus:outline-none"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
            </div>

            
            <div className="space-y-3">
                {visible.map(c => (
                    <div key={c.id} className="flex items-start gap-2">
                        <button
                            className="w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold"
                            title={c.userId}
                        >
                            {c.userId.charAt(0).toUpperCase()}
                        </button>

                        <div className="bg-gray-100 px-4 py-2 rounded-xl w-full">
                            {editingId === c.id ? (
                                <textarea
                                    className="w-full border rounded p-2 text-sm"
                                    value={editedContent}
                                    onChange={e => setEditedContent(e.target.value)}
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
                                            <button onClick={() => handleSaveEdit(c.id)} className="text-blue-600">
                                                Save
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500">
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { setEditingId(c.id); setEditedContent(c.content); }} className="text-blue-600">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="text-red-600">
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Prev
                    </button>

                    <span className="text-sm font-medium text-gray-700">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentsSection;

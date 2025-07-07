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

const CommentsSection = ({ storyId, userId }: CommentsSectionProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');

    const fetchComments = async () => {
        try {
            const res = await API.get(`/comments?storyId=${storyId}`);
            setComments(res.data);
        } catch (err) {
            console.error('Failed to load comments');
        }
    };

    useEffect(() => {
        fetchComments();
    }, [storyId]);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;

        try {
            await API.post(`/comments/${storyId}`, { content: newComment.trim() });
            setNewComment('');
            fetchComments();
        } catch (err) {
            alert('Failed to post comment');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await API.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c.id !== commentId));
        } catch {
            alert('Failed to delete');
        }
    };

    const handleEdit = (comment: Comment) => {
        setEditingId(comment.id);
        setEditedContent(comment.content);
    };

    const handleSaveEdit = async (commentId: string) => {
        try {
            await API.put(`/comments/${commentId}`, { content: editedContent.trim() });
            setEditingId(null);
            setEditedContent('');
            fetchComments();
        } catch {
            alert('Failed to update');
        }
    };

    return (
        <div className="mt-6">
           
            <div className="flex items-start gap-2 mb-4">
                <img src="/default-avatar.png" alt="avatar" className="w-9 h-9 rounded-full" />
                <input
                    type="text"
                    className="w-full border rounded-full px-4 py-2 bg-gray-100 focus:outline-none"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
            </div>

           
            <div className="space-y-3">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-2">
                        <img src="/default-avatar.png" alt="user" className="w-8 h-8 rounded-full" />
                        <div className="bg-gray-100 px-4 py-2 rounded-xl max-w-[80%] w-full">
                           
                            {editingId === comment.id ? (
                                <textarea
                                    value={editedContent}
                                    onChange={e => setEditedContent(e.target.value)}
                                    className="w-full border rounded p-2 mt-1 text-sm"
                                />
                            ) : (
                                <p className="text-sm mt-1">{comment.content}</p>
                            )}

                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(comment.createdAt).toLocaleTimeString()}
                            </p>

                          
                            {comment.userId === userId && (
                                <div className="text-xs space-x-3 mt-2">
                                    {editingId === comment.id ? (
                                        <>
                                            <button onClick={() => handleSaveEdit(comment.id)} className="text-blue-600">Save</button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-500">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => handleEdit(comment)} className="text-blue-600">Edit</button>
                                            <button onClick={() => handleDelete(comment.id)} className="text-red-600">Delete</button>
                                        </>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default CommentsSection;

import { useEffect, useState } from 'react';
import API from '../../services/api';

interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
}

export default function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`comments/${id}`);
      fetchComments();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Moderate Comments</h1>

      <input
        type="text"
        placeholder="Search by comment or user..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-sm"
      />

      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Comment</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Post</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 max-w-md">{c.content}</td>
                  <td className="px-4 py-2">{c.author.username}</td>
                  <td className="px-4 py-2">{c.content}</td>
                  <td className="px-4 py-2">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                    {/* Optional:
                    <button className="ml-2 px-3 py-1 bg-gray-500 text-white rounded text-sm">
                      Ban User
                    </button>
                    */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

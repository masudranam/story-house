import { useEffect, useState } from 'react';
import API from '../../services/api';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    email:string;
  };
}
 

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/stories`);
      console.log(res.data.stories);
      setPosts(res.data.stories);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/stories/${id}`);
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Posts</h1>

      <input
        type="text"
        placeholder="Search by title or author..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-sm"
      />

      {loading ? (
        <div>Loading posts...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Created</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{post.title}</td>
                  <td className="px-4 py-2">{post.author.username}</td>
                  <td className="px-4 py-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                     
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

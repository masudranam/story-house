import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const AddPost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/stories', { title, description: content });
      toast.success('Post has been published');       
      navigate('/profile');
    } catch (err: any) {
      toast.error('Publish failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-teal-700">Add New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <textarea
          placeholder="Content"
          rows={6}
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition ${loading
            ? 'bg-teal-400 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700'
            }`}
        >
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </form>
    </div>
  );
};

export default AddPost;

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
  <div className="max-w-2xl mx-auto mt-12 px-4">
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-indigo-600 mb-6">
         Create a New Post
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
          <input
            type="text"
            placeholder="What's on your mind?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Post Content</label>
          <textarea
            rows={6}
            placeholder="Share your thoughts with the community..."
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 text-gray-800 placeholder-gray-400 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white font-semibold transition duration-200 ${
            loading
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Posting...' : ' Post It'}
        </button>
      </form>
    </div>
  </div>
);
}


export default AddPost;

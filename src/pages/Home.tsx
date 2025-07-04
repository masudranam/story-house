import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import API from '../services/api';
 
interface Post {
  id: string;
  title: string;
  description: string;
  authorId: string;
  createdAt: string;
}


const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotale] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get('/stories');
        setPosts(res.data.stories); 
        setTotale(res.data.total);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(
    post =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase()) ||
      post.authorId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Latest Posts</h2>

      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-6 w-full max-w-md px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => <PostCard  key={post.id} {...post} />)
        ) : (
          <p className="text-gray-600 col-span-full">No matching posts found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;

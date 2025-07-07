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

const POSTS_PER_PAGE = 8;

const Home = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get('/stories');
        setPosts(res.data.stories);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filtered = posts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.description.toLowerCase().includes(search.toLowerCase()) ||
    post.authorId.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) =>
    sortAsc
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPages = Math.ceil(sorted.length / POSTS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-blue-700 caret-transparent">Latest Posts</h2>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Sort: {sortAsc ? 'Oldest' : 'Newest'}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="mb-6 w-full max-w-md px-4 py-2 border rounded-xl border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {paginated.length > 0 ? (
          paginated.map(post => <PostCard key={post.id} {...post} />)
        ) : (
          <p className="text-gray-600 col-span-full">No matching posts found.</p>
        )}
      </div>

      <div className="flex justify-center items-center gap-3 mt-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;

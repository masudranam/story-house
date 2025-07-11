import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../services/api';
import { jwtDecode } from 'jwt-decode';
import CommentsSection from '../components/Comment';
import LikeButton from '../components/LikeButton';
import { useUser } from '../context/UserContext';

interface Post {
  id: string;
  title: string;
  description: string;
  authorId: string;
  createdAt: string;
  author: {
    name: string;
    username: string;
    email: string;
  };
}

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const userId = user?.userId;

  const [post, setPost] = useState<Post | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`/stories/${id}`);
        setPost(res.data.story);
        setError(null);
      } catch (err) {
        setError('Failed to load post. Please try again.');
        console.error('Failed to fetch post:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
  }, [id]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const [{ data: likeRes }, { data: likedRes }] = await Promise.all([
          API.get(`/likes/${id}`),
          API.get(`/likes/liked/${id}`),
        ]);
        setLikesCount(likeRes.likes);
        setUserLiked(likedRes);
        setError(null);
      } catch {
        setError('Could not fetch like information.');
        console.warn('Could not fetch like info');
      }
    };
    if (id) fetchLikes();
  }, [id]);

  const handleToggleLike = async () => {
    if (likeLoading || !userId) return;
    setLikeLoading(true);
    try {
      if (userLiked) {
        await API.delete(`/likes/${id}`);
        setLikesCount((c) => Math.max(0, c - 1));
        setUserLiked(false);
      } else {
        await API.post(`/likes/${id}`);
        setLikesCount((c) => c + 1);
        setUserLiked(true);
      }
      setError(null);
    } catch {
      setError('Failed to update like. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error || 'Post not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-5 p-6 bg-white rounded-2xl shadow-lg space-y-6">
      {/* Post Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">{post.title}</h1>
        <p className="text-sm text-gray-500">
          Posted by{' '}
          <span className="font-medium text-blue-600 hover:underline cursor-pointer">
            {post.author.name}
          </span>{' '}
          on {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Post Content */}
      <div className="bg-gray-50 p-4 rounded-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
        {post.description}
      </div>

      {/* Like Button */}
      <div className="flex items-center justify-between">
        <LikeButton
          likesCount={likesCount}
          userLiked={userLiked}
          onToggle={handleToggleLike}
          disabled={likeLoading || !userId}
        />
        {likeLoading && (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div>
        )}
      </div>

      {/* Comments Section */}
      <div className="border-t border-gray-200 pt-6">
        <CommentsSection storyId={post.id} userId={userId || ''} />
      </div>
    </div>
  );
};

export default PostDetail;
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../services/api';
import CommentsSection from '../components/Comment';
import LikeButton from '../components/LikeButton';

import type { Post } from '../dtos/post.dto';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const userId = user?.userId;

  const [post, setPost] = useState<Post | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


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

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

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
    }
  };

  useEffect(() => {
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
        toast.success('You unliked a post');
      } else {
        await API.post(`/likes/${id}`);
        setLikesCount((c) => c + 1);
        setUserLiked(true);
        toast.success('You liked a post');
      }
      setError(null);
    } catch {
      setError('Failed to update like. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) {
   return <Loader />   
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

      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2  caret-transparent">{post.title}</h1>
        <p className="text-sm text-gray-500 caret-transparent">
          Posted by{' '}
          <Link
            to={`/profile/${post.authorId}`}
            onClick={e => e.stopPropagation()}
            className='text-blue-600 hover:font-bold'
          > 
          {post.author.name}
          </Link>{' '}

          on {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>


      <div className="bg-gray-50 p-4 rounded-lg text-gray-800 leading-relaxed whitespace-pre-wrap caret-transparent">
        {post.description}
      </div>


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


      <div className="border-t border-gray-200 pt-6">
        <CommentsSection storyId={post.id} userId={userId || ''} />
      </div>
    </div>
  );
};

export default PostDetail;
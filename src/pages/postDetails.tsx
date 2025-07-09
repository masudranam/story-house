import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import API from '../services/api';
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
  }
}

const PostDetail = () => {
  const { id } = useParams();
  const {user} = useUser();
  const userId = user?.userId;

  const [post, setPost] = useState<Post | null>(null);
  const [likesCount, setLikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);


  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`/stories/${id}`);
        setPost(res.data.story);
      } catch (err) {
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
      } catch {
        console.warn('Could not fetch like info');
      }
    };
    if (id) fetchLikes();
  }, [id]);


  const handleToggleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      if (userLiked) {
        await API.delete(`/likes/${id}`);
        setLikesCount(c => Math.max(0, c - 1));
        setUserLiked(false);
      } else {
        await API.post(`/likes/${id}`);
        setLikesCount(c => c + 1);
        setUserLiked(true);
      }
    } catch {
      alert('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-md space-y-4">


      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{post.title}</h1>
        <p className="text-sm text-gray-500">
          Posted by <span className="font-medium text-blue-600">
            {post.author.name}</span> on{' '}
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>


      <div className="border-t pt-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
        {post.description}
      </div>


      <LikeButton
        likesCount={likesCount}
        userLiked={userLiked}
        onToggle={handleToggleLike}
        disabled={likeLoading}
      />


      <CommentsSection storyId={post.id} userId={userId!} />
    </div>
  );
};

export default PostDetail;

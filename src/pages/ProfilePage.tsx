import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import API from '../services/api';
import PostCard from '../components/PostCard';
import type { Post } from '../dtos/post.dto';

import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';
import DeleteConfirmPopup from '../components/DeleteConfirmPopup';

const POSTS_PER_PAGE = 9;

const Profile = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<{
    name: '',
    username: '',
    email: '',
    createdAt: ''
  } | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const search = searchParams.get('q') || '';

  const navigate = useNavigate();
  const { user } = useAuth();
  const { userId } = useParams();

  const isOwnProfile = !userId || userId === user?.userId;

  useEffect(() => {
    if (user === null) return;
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, userId]);

  const fetchProfile = async () => {

    try {
      const idToFetch = userId || user?.userId;
      const profile = await API.get(`/users/${idToFetch}`);
      setProfile(profile.data);
    } catch (err) {
      setProfile(null);
      toast.error('Failed to load user profile');
    }
  }

  useEffect(() => {
    console.log(profile);
    fetchProfile();
  }, [userId, user?.userId]);


  const fetchPosts = async () => {
    setLoading(true);
    try {
      const idToFetch = userId || user?.userId;

      const res = await API.get('/stories', {
        params: {
          authorId: idToFetch,
          page: currentPage,
          limit: POSTS_PER_PAGE,
          title: search || undefined,
        },
      });

      setPosts(res.data.rows);
      setTotalPages(Math.ceil(res.data.count / POSTS_PER_PAGE));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (user || userId) fetchPosts();
  }, [user, userId, currentPage, search]);

  const handleAddPost = () => navigate('/posts/create');
  const handleEdit = (id: string) => navigate(`/posts/${id}/edit`);

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
      try {
        await API.delete(`/stories/${id}`);
        fetchPosts();
        setShowDeleteConfirm(null);
        toast.success('Post has been deleted');
      } catch (error) {
        toast.error('Failed to delete post');
      }finally{
        setDeleteLoading(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8 caret-transparent">

        <div className="lg:w-1/4 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-semibold">
              {profile?.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">{profile?.username}</h2>
              <p className="text-sm text-gray-500">
                {isOwnProfile ? 'Your Profile' : 'User Profile'}
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">Name : {profile?.name}</p>
            <p className="text-sm text-gray-600">Username : {profile?.username}</p>
            <p className="text-sm text-gray-600">Email : {profile?.email}</p>
            <p className="text-sm text-gray-600">
              Joined: {new Date(profile?.createdAt || '').toLocaleDateString()}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/users/settings')}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>


        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {isOwnProfile ? 'Your Posts' : `Posts by ${profile?.username}`}
            </h1>
          </div>

          {isOwnProfile && (
            <button
              onClick={handleAddPost}
              className="mb-6 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 caret-transparent"
            >
              Add New Post
            </button>
          )}

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {loading ? (
              <p className="text-gray-500 col-span-full text-center">Loading...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center">No posts found.</p>
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  {...post}
                  onDelete={
                    isOwnProfile || user?.role === 1 ? ()=> setShowDeleteConfirm(post.id) : undefined
                  }
                  onEdit={isOwnProfile ? handleEdit : undefined}
                />
              ))
            )}
          </div>

          {showDeleteConfirm && (
            <DeleteConfirmPopup
              onConfirm={() => handleDelete(showDeleteConfirm)}
              onCancel={() => setShowDeleteConfirm(null)}
              loading={deleteLoading}
              className='fixed top-40 right-160 z-50'
            />
          )}

          <Pagination
            page={currentPage}
            setPage={setCurrentPage}
            totalPages={totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
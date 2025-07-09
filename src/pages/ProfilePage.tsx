import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import PostCard from '../components/PostCard';
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

const Profile = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const { user } = useUser();
    const { userId } = useParams(); // optional param: /profile/:userId

    const isOwnProfile = !userId || userId === user?.userId;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (isOwnProfile) {
            setUsername(user.username ?? 'User');
        }
    }, [user, userId]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const idToFetch = userId || user?.userId;
                const res = await API.get(`/stories?authorId=${idToFetch}`);
                setPosts(res.data.stories);

                if (!isOwnProfile && res.data.stories.length > 0) {
                    setUsername(res.data.stories[0].author.name);
                }
            } catch {
                setPosts([]);
            }
        };

        if (user || userId) fetchPosts();
    }, [user, userId]);

    const handleAddPost = () => {
        navigate('/add-post');
    };

    const handleEdit = (id: string) => {
        navigate(`/edit-post/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            try {
                await API.delete(`/stories/${id}`);
                setPosts(posts.filter(post => post.id !== id));
            } catch (error) {
                console.error('Failed to delete post:', error);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <div className="flex items-center justify-between mb-6 caret-transparent">
                <h1 className="text-2xl font-bold">
                    {isOwnProfile ? 'Welcome, ' : 'Posts by '}
                    {username}
                </h1>
            </div>

            {isOwnProfile && (
                <button
                    onClick={handleAddPost}
                    className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                >
                    Add New Post
                </button>
            )}

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {posts.length === 0 && <p>No posts yet.</p>}
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        {...post}
                        onDelete={isOwnProfile || user?.role === 1? handleDelete : undefined}
                        onEdit={isOwnProfile ? handleEdit : undefined}
                    />
                ))}
            </div>
        </div>
    );
};

export default Profile;

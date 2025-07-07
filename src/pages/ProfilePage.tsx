import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import PostCard from '../components/PostCard';

interface Post {
    id: string;
    title: string;
    description: string;
    authorId: string;
    createdAt: string;
}

const Profile = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    let authorId = "";

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUsername(payload.userId || 'User');
            authorId = payload.userId;
        } catch {
            setUsername('User');
        }

        const fetchPosts = async () => {
            try {
                const res = await API.get(`/stories?authorId=${authorId}`);
                setPosts(res.data.stories);
            } catch {
                setPosts([]);
            }
        };

        fetchPosts();
    }, [navigate]);



    const handleAddPost = () => {
        navigate('/add-post');
    };

    const hadnleEdit = (id: string) => {
        navigate(`/edit-post/${id}`);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure want to delete this post?')) {
            try {
                await API.delete(`/stories/${id}`);
                setPosts(posts.filter(post => post.id !== id));
            } catch (error) {
                console.error('Failed to delete post:', error);
            }
        }
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Welcome, {username}</h1>
            </div>

            <button
                onClick={handleAddPost}
                className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Add New Post
            </button>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {posts.length === 0 && <p>No posts yet.</p>}
                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        {...post}
                        onDelete={handleDelete}
                        onEdit={hadnleEdit}
                    />
                ))}
            </div>
        </div>
    );
};

export default Profile;

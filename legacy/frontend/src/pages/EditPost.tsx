import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import API from '../services/api';
import toast from 'react-hot-toast';

const EditPost = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [originalPost, setOriginalPost] = useState({ title: '', description: '' });

    useEffect(() => {
        const loadPost = async () => {
            if (location.state?.title) {
                setTitle(location.state.title);
                setDescription(location.state.description);
                setOriginalPost({
                    title: location.state.title,
                    description: location.state.description,
                });
            } else {
                try {
                    
                    const res = await API.get(`/stories/${id}`);
                    setTitle(res.data.story.title);
                    setDescription(res.data.story.description);
                    setOriginalPost({
                        title: res.data.story.title,
                        description: res.data.story.description,
                    });
                } catch {
                    toast.error('Failed to load post');
                    navigate('/');
                }
            }
        };

        loadPost();
    }, [id, location.state, navigate]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedTitle = title.trim() === '' ? originalPost.title : title.trim();
        const updatedDescription = description.trim() === '' ? originalPost.description : description.trim();


        if (
            updatedTitle === originalPost.title &&
            updatedDescription === originalPost.description
        ) {
            toast.success('No update happens');
            navigate('/profile');
        }

        try {
            await API.put(`/stories/${id}`, {
                title: updatedTitle,
                description: updatedDescription,
            });
            toast.success('Successfully updated');
            navigate('/profile');
        } catch (err) {
            toast.error('Failed to update post');
        }
    };


    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
            <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    className="w-full border px-4 py-2 rounded"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title"
                />
                <textarea
                    className="w-full border px-4 py-2 rounded"
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Description"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                    Update Post
                </button>
            </form>
        </div>
    );
};

export default EditPost;

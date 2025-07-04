 
import {  useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../services/api';


const PostDetail = () => {
    const { id } = useParams();                     
 
    const [title, setTitle] = useState('');
    const [authorId, setAuthorid] = useState('');
    const [createdAt, setCreatedat] = useState('');
    const [description, setDescription] = useState('');

   
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await API.get(`/stories/${id}`);
                const { title, description, authorId, createdAt } = res.data.story;
                setTitle(title);
                setAuthorid(authorId);
                setCreatedat(createdAt);
                setDescription(description);

            } catch {
                
            }
        };
        fetchPost();
    }, []);

    return (
        <div className="animate-slide-in-right max-w-3xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-blue-800">Title of the story  <br /> {title}</h1>
            <p className="mt-2 text-gray-700 whitespace-normal break-words">{description}</p>
            <small className="text-gray-500">
                By {authorId} on {new Date(createdAt).toLocaleDateString()}
            </small>
        </div>
    );
};

export default PostDetail;

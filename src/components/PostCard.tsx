
import { Link } from 'react-router-dom';

interface Props {
  id: string;                
  title: string;
  description: string;
  authorId: string;
  createdAt: string;
}

const PostCard = ({ id, title, description, authorId, createdAt }: Props) => (
  <Link
    to={`/stories/${id}`}                          
    state={{ title, description, authorId, createdAt }} 
    className="block bg-white p-6 rounded-lg shadow-md 
               border border-gray-200 hover:shadow-lg transition"
  >
    <h3 className="text-xl font-semibold text-blue-800">{title}</h3>
    <p className="mt-2 text-gray-700 line-clamp-3">{description}</p>
    <small className="text-gray-500 mt-3 block">
      By {authorId} on {new Date(createdAt).toLocaleDateString()}
    </small>
  </Link>
);

export default PostCard;

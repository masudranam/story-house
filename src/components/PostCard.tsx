
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  id: string;
  title: string;
  description: string;
  authorId: string;
  createdAt: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const PostCard = ({ id, title, description, authorId, createdAt, onEdit, onDelete }: Props) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(prev => !prev);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(id);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete?.(id);
  };

  return (

    <div className="relative bg-white rounded shadow border h-full flex flex-col justify-between">
 
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-black focus:outline-none"
          >
            ⋮
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-10">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
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

    </div>
  )
};

export default PostCard;

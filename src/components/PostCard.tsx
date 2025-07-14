import {  useState } from 'react';
import { Link } from 'react-router-dom';
import type { Props } from '../dtos/PostCardProps.dto';
 

const PostCard = ({
  id,
  title,
  description,
  authorId,
  author,
  createdAt,
  likesCount,
  commentsCount,
  onEdit,
  onDelete,
}: Props) => {
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
    <div className="relative bg-white h-full flex flex-col justify-between">
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-3">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-black focus:outline-none"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-20">
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
        className="block bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition"
      >
        <h3 className="text-xl font-semibold text-blue-800 line-clamp-1">{title}</h3>
        <p className="mt-2 text-gray-700 line-clamp-1">{description}</p>

        <small className="text-gray-500 mt-3 block">
          By{' '}
          <Link
            to={`/profile/${authorId}`}
            onClick={e => e.stopPropagation()}
            className="text-blue-600 hover:font-bold"
          >
            {author.name}
          </Link>{' '}
          on {new Date(createdAt).toLocaleDateString()}
        </small>

        
        {/* <div className="mt-4 ml-6 flex gap-20 text-sm text-gray-600 items-center">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{likesCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{commentsCount || 0}</span>
          </div>
        </div> */}
      </Link>
    </div>
  );
};

export default PostCard;

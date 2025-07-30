import { useNavigate } from 'react-router-dom';

interface UserProps {
  id: string;
  username: string;
  email: string;
  role: 0 | 1;
  createdAt: string;
  onDelete?: (id: string) => void;
}

const UserCard = ({ id, username, email, role, createdAt, onDelete }: UserProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/profile/${id}`)}
      className="cursor-pointer bg-white border rounded-lg shadow p-4 hover:shadow-lg transition group relative"
    >
      <div className="text-lg font-semibold text-blue-800 mb-1">{username}</div>
      <div className="text-sm text-gray-600 mb-1">{email}</div>
      <div className="text-xs text-gray-500 mb-2">
        Joined on {new Date(createdAt).toLocaleDateString()}
      </div>

      <div
        className={`text-xs inline-block px-2 py-0.5 rounded-full text-white ${
          role === 1 ? 'bg-green-500' : 'bg-yellow-500'
        }`}
      >
        {role === 1 ? 'Admin' : 'User'}
      </div>

      {role !== 1 && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="absolute top-2 right-2 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default UserCard;

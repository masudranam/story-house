import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 0 | 1;
  createdAt: string;
}

const USERS_PER_PAGE = 5;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/users`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔍 Filter + Search + Paginate
  const filteredUsers = users
    .filter(u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .filter(u =>
      roleFilter === 'all'
        ? true
        : roleFilter === 'admin'
        ? u.role === 1
        : u.role === 0
    );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const visibleUsers = filteredUsers.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded w-full sm:w-1/2"
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as any);
            setPage(1);
          }}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>

      {loading ? (
        <div>Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {visibleUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => navigate(`/profile/${u.id}`)}
                className="cursor-pointer bg-white border rounded-lg shadow p-4 hover:shadow-lg transition group relative"
              >
                <div className="text-lg font-semibold text-blue-800 mb-1">{u.username}</div>
                <div className="text-sm text-gray-600 mb-1">{u.email}</div>
                <div className="text-xs text-gray-500 mb-2">
                  Joined on {new Date(u.createdAt).toLocaleDateString()}
                </div>

                <div
                  className={`text-xs inline-block px-2 py-0.5 rounded-full text-white ${
                    u.role === 1 ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                >
                  {u.role === 1 ? 'Admin' : 'User'}
                </div>

                {u.role === 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(u.id);
                    }}
                    className="absolute top-2 right-2 text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-8 items-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="text-sm font-medium text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

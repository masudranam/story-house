import { useEffect, useState } from 'react';
import API from '../../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 0 | 1;
  createdAt: string;
}



export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/users`);
      setUsers(res.data);
      console.log(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  

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
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      <input
        type="text"
        placeholder="Search by username or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-sm"
      />

      {loading ? (
        <div>Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    {u.role == 0 && (
                         <span className="ml-3 text-xs bg-yellow-400 px-2 py-0.5 rounded-full">User</span>
                    )}
                    {u.role === 1 && (
                      <span className="ml-2 text-xs bg-green-400 px-2 py-0.5 rounded-full">Admin</span>
                    )}

                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {u.role === 0 && (
                      <>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

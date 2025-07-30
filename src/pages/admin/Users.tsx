import { useEffect, useState } from 'react';
import API from '../../services/api';
import UserCard from '../../components/UserCard';
import type { User } from '../../dtos/User.dto';
import { useSearchParams } from 'react-router-dom';
import DeleteConfirmPopup from '../../components/DeleteConfirmPopup';
import Pagination from '../../components/Pagination';
import DeleteConfirmModal from '../../components/DeleteConfirmation';

const USERS_PER_PAGE = 6;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('q') || '';

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/users', {
        params: {
          page,
          limit: USERS_PER_PAGE,
          search,
          role: roleFilter !== 'all' ? roleFilter : undefined,
        },
      });
      setUsers(res.data.rows);
      setTotalPages(Math.ceil(res.data.count / USERS_PER_PAGE));
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await API.delete(`/users/${id}`);
      setShowDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      setShowDeleteConfirm(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg caret-transparent">



      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Manage Users</h1>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as 'all' | 'admin' | 'user');
            setPage(1);
          }}
          className="  sm:w-40 px-3 py-2.5 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200  text-sm font-medium"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="user">Users</option>
        </select>
      </div>



      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}


      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-600 py-6">No users found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                {...user}
                onDelete={() => setShowDeleteConfirm(user.id)}
              />
            ))}
          </div> 

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              setPage={setPage}
              loading={loading}
            />
          )}
        </>
      )}

      {showDeleteConfirm && (
        <DeleteConfirmPopup
          onConfirm={() => handleDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
          loading={deleteLoading}
          className='fixed top-40 right-160 z-50'
        />
      )}
    </div>
  );
}
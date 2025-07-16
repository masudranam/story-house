import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  newUsersThisWeek: number;
  newPostsThisWeek: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/users/states');
        setStats(res.data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard stats. Please try again.');
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats || error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error || 'No stats available.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg caret-transparent">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Users" value={stats.totalUsers} link="/admin/users" />
        <StatCard label="Total Posts" value={stats.totalPosts} link="/admin/posts" />
        <StatCard label="Total Comments" value={stats.totalComments} link="/admin/comments" />
        <StatCard label="New Users This Week" value={stats.newUsersThisWeek} link="/admin/users" />
        <StatCard label="New Posts This Week" value={stats.newPostsThisWeek} link="/admin/posts" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  link,
}: {
  label: string;
  value: number;
  link: string;
}) {
  return (
    <Link to={link}>
      <div className="bg-gray-50 rounded-lg shadow-md p-5 text-center hover:bg-blue-50 hover:shadow-lg transition-all duration-200 cursor-pointer">
        <h3 className="text-sm font-medium text-gray-600 mb-2">{label}</h3>
        <p className="text-3xl font-bold text-blue-600">{value}</p>
      </div>
    </Link>
  );
}
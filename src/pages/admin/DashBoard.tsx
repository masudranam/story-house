import { Link } from 'react-router-dom';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  newUsersThisWeek: number;
  newPostsThisWeek: number;
}

const stats: Stats = {
  totalUsers: 5,
  totalPosts: 5,
  totalComments: 5,
  newUsersThisWeek: 3,
  newPostsThisWeek: 2,
};

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers} link="/admin/users" />
        <StatCard label="Total Posts" value={stats.totalPosts} link="/admin/posts" />
        <StatCard label="Total Comments" value={stats.totalComments} link="/admin/comments" />
        <StatCard label="New Users (This Week)" value={stats.newUsersThisWeek} link="/admin/users" />
        <StatCard label="New Posts (This Week)" value={stats.newPostsThisWeek} link="/admin/posts" />
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
      <div className="bg-white rounded shadow p-5 text-center hover:bg-blue-50 cursor-pointer">
        <h3 className="text-lg text-gray-500 mb-2">{label}</h3>
        <p className="text-3xl font-bold text-blue-700">{value}</p>
      </div>
    </Link>
  );
}

// src/pages/settings/UserInfo.tsx
import { useEffect, useState } from 'react';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';

interface Profile { name: string; username: string; email: string }

interface TokenPayload {
  userId: string;
}

function getUserIdFromToken(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.userId;
  } catch {
    return null;
  }
}

const UserInfo = () => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
       const userId = getUserIdFromToken();
    if (!userId) return;

    API.get(`/users/${userId}`)
      .then(res => setProfile(res.data))
      .catch(() => alert('Failed to load profile'));
  }, []);

  if (!profile) return <p>Loading…</p>;

  return (
    <div className="space-y-4">
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Email:</strong> {profile.email}</p>
    </div>
  );
};

export default UserInfo;

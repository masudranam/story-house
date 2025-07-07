import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import API from '../services/api';

interface TokenPayload {
  userId: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  // Add more fields if needed
}

const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.userId;
  } catch {
    return null;
  }
};

const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = getUserIdFromToken();
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get(`/users/${userId}`);
        setUser(res.data);
      } catch {
        console.error('Failed to fetch user info');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};

export default useCurrentUser;

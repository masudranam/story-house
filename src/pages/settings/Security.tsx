// src/pages/settings/Security.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';


interface TokenPayload {
  userId: string;
}

const Security = () => {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const navigate = useNavigate();

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await API.post('/auth/change-password', { oldPw, newPw });
    alert('Password updated');
    setOldPw(''); setNewPw('');
  };

 const deleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Not logged in');
      return;
    }

    let userId: string;
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      userId = decoded.userId;
    } catch {
      alert('Invalid token');
      return;
    }

    if (!window.confirm('Are you sure you want to delete your account?')) return;

    try {
      await API.delete(`/users/${userId}`);
      localStorage.removeItem('token');
      navigate('/signup');
    } catch (error) {
      alert('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      {/* password */}
      <form onSubmit={changePassword} className="space-y-4 max-w-md">
        <h3 className="font-semibold">Change Password</h3>
        <input
          className="w-full border px-3 py-2 rounded"
          type="password"
          placeholder="Current password"
          value={oldPw}
          onChange={e => setOldPw(e.target.value)}
          required
        />
        <input
          className="w-full border px-3 py-2 rounded"
          type="password"
          placeholder="New password"
          value={newPw}
          onChange={e => setNewPw(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Update
        </button>
      </form>

      {/* delete */}
      <div>
        <h3 className="font-semibold mb-2">Danger Zone</h3>
        <button
          onClick={deleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Security;

// src/pages/settings/Security.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import TextInput from '../../components/TextInput';


interface TokenPayload {
    userId: string;
    role:Number;
    username: string;
}

const Security = () => {
 const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  let userId = '';

  try {
    if (!token) throw new Error('No token');
    const decoded = jwtDecode<TokenPayload>(token);
    userId = decoded.userId;
  } catch {
    alert('Invalid or missing token. Please login again.');
    navigate('/login');
    return null;
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.patch(`/users/change-password/${userId}`, { oldPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to change password');
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account?')) return;

    try {
      await API.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      alert('Account deleted');
      navigate('/signup');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

    return (
        <div className="space-y-6">
            {/* password */}
            <form onSubmit={changePassword} className="space-y-4 max-w-md">
                <h3 className="font-semibold">Change Password</h3>
                <TextInput
                    type="password"
                    placeholder="Current password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    toggleVisibility
                    required
                />
                <TextInput
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    toggleVisibility
                    onChange={e => setNewPassword(e.target.value)}
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

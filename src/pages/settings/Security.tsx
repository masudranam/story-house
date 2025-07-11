import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import TextInput from '../../components/TextInput';

interface TokenPayload {
    userId: string;
    role: number;
    username: string;
}

const Security = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    let userId = '';

    try {
        if (!token) throw new Error('No token');
        const decoded = jwtDecode<TokenPayload>(token);
        userId = decoded.userId;
    } catch {
        setError('Invalid or missing token. Please login again.');
        navigate('/login');
        return null;
    }

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword || !newPassword) {
            setError('Both passwords are required.');
            return;
        }
        setIsSubmitting(true);
        try {
            await API.patch(`/users/change-password/${userId}`, { oldPassword, newPassword });
            setOldPassword('');
            setNewPassword('');
            setError(null);
            alert('Password updated successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteAccount = async () => {
        setIsSubmitting(true);
        try {
            await API.delete(`/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            localStorage.removeItem('token');
            alert('Account deleted successfully.');
            navigate('/signup');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete account.');
            setShowDeleteConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-4">
            {/* Change Password Section */}
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Change Password</h2>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={changePassword} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Password
                            </label>
                            <TextInput
                                type="password"
                                placeholder="Enter current password"
                                value={oldPassword}
                                onChange={e => setOldPassword(e.target.value)}
                                toggleVisibility
                                required
                                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Password
                            </label>
                            <TextInput
                                type="password"
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                toggleVisibility
                                required
                                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 font-medium text-sm disabled:opacity-50 flex items-center justify-center"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center">
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Updating...
                            </span>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>

            {/* Delete Account Section */}
            <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Danger Zone</h2>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 font-medium text-sm disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Account Deletion</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete your account? This action is permanent and cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={deleteAccount}
                                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-all duration-200 font-medium text-sm disabled:opacity-50 flex items-center justify-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Deleting...
                                    </span>
                                ) : (
                                    'Yes, Delete'
                                )}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Security;
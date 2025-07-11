import { useEffect, useState } from 'react';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import TextInput from '../../components/TextInput';
import toast from 'react-hot-toast';

interface Profile {
    username: string;
}

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
    const [profile, setProfile] = useState<Profile>({ username: '' });
    const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const userId = getUserIdFromToken();

    useEffect(() => {
        if (!userId) {
            setError('Please log in to view your profile.');
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await API.get(`/users/${userId}`);
                setProfile({ username: res.data.username });
                setOriginalProfile({ username: res.data.username });
            } catch {
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
        setError(null);
    };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('form submited');
  if (!profile.username.trim()) {
    setError('Username cannot be empty.');
    toast.error('Username cannot be empty.');
    return;
  }
  setIsSubmitting(true);
  try {
 
    await API.put(`/users/${userId}`, profile);
     
    setEditMode(false);
    setOriginalProfile(profile);
    setError(null);
    toast.success('Username updated successfully!');
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to update username.';
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

    const handleCancel = () => {
        if (originalProfile) setProfile(originalProfile);
        setEditMode(false);
        setError(null);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Username</h2>
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className={`p-4 rounded-lg transition-all duration-300 ${editMode ? 'bg-gray-50 border border-gray-200' : 'bg-gray-100'}`}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                    </label>
                    <input
                        name="username"
                        value={profile.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        disabled={!editMode}
                        className={`w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${editMode ? 'bg-white' : 'bg-gray-100 text-gray-600 cursor-not-allowed'}`}
                    />
                </div>
                <div className="flex gap-3">
                    {!editMode ? (
                        <button
                            type="button"
                            onClick={() => setEditMode(true)}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 font-medium text-sm disabled:opacity-50"
                            disabled={!!error}
                        >
                            Edit Username
                        </button>
                    ) : (
                        <>
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 font-medium text-sm disabled:opacity-50 flex items-center justify-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                        Saving...
                                    </span>
                                ) : (
                                    'Save'
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UserInfo;
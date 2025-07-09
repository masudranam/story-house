import { useEffect, useState } from 'react';
import API from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import TextInput from '../../components/TextInput';

interface Profile {
    name: string;
    username: string;
    email: string;
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
    const [profile, setProfile] = useState<Profile>({ name: '', username: '', email: '' });
    const [originalProfile, setOriginalProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const userId = getUserIdFromToken();

    useEffect(() => {
        if (!userId) return;

        const fetchUser = async () => {
            try {
                const res = await API.get(`/users/${userId}`);
                setProfile(res.data);
                setOriginalProfile(res.data);
            } catch {
                alert('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.put(`/users/${userId}`, profile);
            setEditMode(false);
            setOriginalProfile(profile);
            alert('Profile updated!');
        } catch {
            alert('Update failed');
        }
    };

    const handleCancel = () => {
        if (originalProfile) setProfile(originalProfile);
        setEditMode(false);
    };

    if (loading) return <p>Loading…</p>;

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4"
        >
            <h2 className="text-xl font-bold">User Information</h2>

            
                <label className="block font-medium mb-1">Name</label>
                <TextInput
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    type="text"
                    required
                    disabled={!editMode}
                />
                <label className="block font-medium mb-1">Username</label>
                <TextInput
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    disabled={!editMode}
                />
                <label className="block font-medium mb-1">Email</label>
                <TextInput
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!editMode}
                />
           

       
            <div className="pt-2">
                {!editMode ? (
                    <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Update
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="text-gray-600 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
};

export default UserInfo;

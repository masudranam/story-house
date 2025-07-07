import { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import TextInput from '../components/TextInput';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/users/signup', {
        name,
        username,
        email,
        password,
      });
      alert('Signup successful!');
      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md z-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Sign Up</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <TextInput
            type="text"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full Name"
            required
          />
          <TextInput
            type="text"
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <TextInput
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email Address"
            required
          />
          <TextInput
            type="password"
            toggleVisibility
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Enter password'
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

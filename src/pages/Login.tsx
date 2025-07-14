import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import TextInput from '../components/TextInput';
 
import { useAuth } from '../context/AuthContext';

 
const Login = () => {
  const {user, login, token} = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const[rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();


  useEffect(()=>{
    if(token){
      navigate('/');
    }
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('/users/login', { identifier, password });
      let token = res.data.token;

      if (token.startsWith('Bearer ')) token = token.split(' ')[1];
      login(token, rememberMe);
      navigate('/profile');
    } catch {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md z-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            type="text"
            name="identifier"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder='Username or email'
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
             <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="remember" className="text-sm">
          Remember me
        </label>
      </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

 
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface TokenPayload {
  userId: string;
  username?: string; // or adjust based on your token payload
}


const Navbar = () => {
   const [username, setUsername] = useState<string | null>(null);
   const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setUsername('User');
      } catch {
        setUsername(null);
      }
    }else{
      setUsername(null);
    }
  }, [localStorage.getItem('token')]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername(null);
    navigate('/login');
  };
  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">BlogApp</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="#" className="hover:underline">About</Link>
        <Link to="#" className="hover:underline">Contact</Link>
        {username?(
           <div className="inline-block relative">
            <button onClick={()=>setShowDropdown(!showDropdown)}>{username}</button>
            {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-lg">
              <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">Profile</Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-200">Logout</button>
            </div>
            )}
          </div>
        ):(
          <Link to="/login" className="hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

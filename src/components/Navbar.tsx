
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
interface TokenPayload {
  userId: string;
  role?: Number;
}
const Navbar = () => {
 const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(Boolean);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setUsername(null);

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const firstChar = decoded?.userId?.charAt(0)?.toUpperCase();
      console.log(decoded);
      setUsername(firstChar || 'U');
      setIsAdmin(decoded.role === 1);
    } catch {
      setUsername(null);
      setIsAdmin(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername(null);
    navigate('/login');
  };

  return (
    <nav className="bg-blue-700 text-blue-50 px-8 py-6 flex justify-between items-center caret-transparent">
      <h1 className="text-xl font-bold">BlogApp</h1>

      <div className="space-x-4">
        <Link to="/" className="hover:underline ">Home</Link>
        <Link to="#" className="hover:underline">About</Link>
        <Link to="#" className="hover:underline">Contact</Link>

        {username ? (
          <div className="inline-block relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 bg-blue-600 text-white rounded-full  hover:bg-green-800 cursor-pointer"
              title={username.slice(0, 1)}
            >
              {username?.charAt(0).toUpperCase()}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-30 bg-white text-black rounded ">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">Profile</Link>
                {isAdmin && (
                  <Link to="/admin" className="block px-4 py-2 hover:bg-gray-200">
                    Admin
                  </Link>
                )}                
                <Link to="/settings" className="block px-4 py-2 hover:bg-gray-200">Settings</Link>

                <button
                  onClick={handleLogout}
                  title="You will loged out from the user"
                  className="block w-full text-left px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const { user, setUser } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-semibold tracking-tight">
        <Link to="/" className="hover:text-blue-200 transition-colors duration-200">
          BlogApp
        </Link>
      </h1>

      <div className="flex items-center space-x-6">
        <Link
          to="/"
          className="text-sm font-medium hover:text-blue-200 transition-colors duration-200"
        >
          Home
        </Link>
        <Link
          to="/about"
          className="text-sm font-medium hover:text-blue-200 transition-colors duration-200"
        >
          About
        </Link>
        <Link
          to="/contact"
          className="text-sm font-medium hover:text-blue-200 transition-colors duration-200"
        >
          Contact
        </Link>

        {user?.username ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              title={user.username}
            >
              <span className="text-sm font-medium">{user.username?.charAt(0)}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl overflow-hidden transform transition-all duration-200 ease-in-out origin-top">
                <Link
                  to="/profile"
                  className="block px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                >
                  Profile
                </Link>
                {user.role === 1 && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/settings"
                  className="block px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  title="You will be logged out"
                  className="block w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium hover:text-blue-200 transition-colors duration-200"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
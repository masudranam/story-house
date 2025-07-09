
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
    <nav className="bg-blue-700 text-blue-50 px-8 py-6 flex justify-between items-center caret-transparent">
      <h1 className="text-xl font-bold"> <Link to="/" >BlogApp</Link></h1>

      <div className="space-x-4">
        <Link to="/" className="hover:underline ">Home</Link>
        <Link to="#" className="hover:underline">About</Link>
        <Link to="#" className="hover:underline">Contact</Link>

        {user?.username ? (
          <div className="inline-block relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 bg-blue-600 text-white rounded-full  hover:bg-green-800 cursor-pointer"
              title={user.username}
            >
              {user.username?.charAt(0)}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-30 bg-white text-black rounded ">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-200">Profile</Link>
                {user.role === 1 && (
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

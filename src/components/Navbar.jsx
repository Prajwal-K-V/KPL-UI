/**
 * Navbar Component
 * Navigation bar with user info and logout
 */

import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call parent callback
      onLogout();
      
      // Navigate to login
      navigate('/login');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title - Responsive sizing */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg">
              🏏 <span className="hidden xs:inline">KPL - 2025</span>
              <span className="inline xs:hidden">KPL 2025</span>
            </h1>
          </div>
          
          {/* Right side - User info and logout */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Avatar and Name */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white bg-opacity-30 backdrop-blur-sm border-2 border-white flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white font-medium text-sm hidden sm:block drop-shadow truncate max-w-[120px] md:max-w-none">
                {user?.username}
              </span>
            </div>
            
            {/* Logout Button - Responsive text */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 sm:px-4 py-2 border-2 border-white text-xs sm:text-sm font-medium rounded-lg text-white bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-600 transition-all duration-200"
              title="Logout"
            >
              <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;


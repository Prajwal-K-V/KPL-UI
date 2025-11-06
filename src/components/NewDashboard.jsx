/**
 * NewDashboard Component
 * Main dashboard with team management and all players view
 */

import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Teams from './Teams';
import Dashboard from './Dashboard';

function NewDashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('players'); // 'players' or 'teams'
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Auto-hide messages after 4 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setError('');
  };

  const handleError = (message) => {
    setError(message);
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-2">
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveView('players')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeView === 'players'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              All Players
            </button>
            <button
              onClick={() => setActiveView('teams')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                activeView === 'teams'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Teams & Groups
            </button>
          </nav>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md animate-fadeIn">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-md animate-fadeIn">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeView === 'players' ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Dashboard 
              user={user} 
              onLogout={onLogout}
              onSuccess={handleSuccess}
              onError={handleError}
              hideNavbar={true}
            />
          </div>
        ) : (
          <Teams onSuccess={handleSuccess} onError={handleError} />
        )}
      </div>
    </div>
  );
}

export default NewDashboard;


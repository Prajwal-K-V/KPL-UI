/**
 * Dashboard Component
 * Main dashboard for managing players
 */

import { useState, useEffect } from 'react';
import { playersAPI } from '../services/api';
import Navbar from './Navbar';
import PlayerList from './PlayerList';
import PlayerForm from './PlayerForm';

function Dashboard({ user, onLogout }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load players on component mount
  useEffect(() => {
    loadPlayers();
  }, []);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  /**
   * Load all players from API
   */
  const loadPlayers = async () => {
    try {
      setLoading(true);
      const response = await playersAPI.getAll();
      setPlayers(response.data.data);
    } catch (err) {
      setError('Failed to load players');
      console.error('Load players error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission (add or update player)
   */
  const handleFormSubmit = async (playerData) => {
    try {
      setFormLoading(true);
      setError('');

      if (editingPlayer) {
        // Update existing player
        await playersAPI.update(editingPlayer.id, playerData);
        setSuccessMessage('Player updated successfully!');
      } else {
        // Create new player
        await playersAPI.create(playerData);
        setSuccessMessage('Player added successfully!');
      }

      // Reload players and close form
      await loadPlayers();
      setShowForm(false);
      setEditingPlayer(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save player');
      console.error('Save player error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (player) => {
    setEditingPlayer(player);
    setShowForm(true);
    setError('');
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async (player) => {
    if (!window.confirm(`Are you sure you want to delete ${player.player_name}?`)) {
      return;
    }

    try {
      setError('');
      await playersAPI.delete(player.id);
      setSuccessMessage('Player deleted successfully!');
      await loadPlayers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete player');
      console.error('Delete player error:', err);
    }
  };

  /**
   * Handle search
   */
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      loadPlayers();
      return;
    }

    try {
      const response = await playersAPI.search(query);
      setPlayers(response.data.data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  /**
   * Handle add new player button
   */
  const handleAddNew = () => {
    setEditingPlayer(null);
    setShowForm(true);
    setError('');
  };

  /**
   * Handle cancel form
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlayer(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Players</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage your player roster
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Player
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-fadeIn">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded animate-fadeIn">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search players by name or team..."
                value={searchQuery}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="mb-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h3>
              <PlayerForm
                player={editingPlayer}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
                isLoading={formLoading}
              />
            </div>
          )}

          {/* Players List */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <PlayerList
              players={players}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
            />
          </div>

          {/* Stats Footer */}
          {!loading && players.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Showing {players.length} player{players.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


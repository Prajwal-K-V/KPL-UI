/**
 * Dashboard Component
 * Main dashboard for managing players
 */

import { useState, useEffect, useMemo } from 'react';
import { playersAPI } from '../services/api';
import Navbar from './Navbar';
import PlayerList from './PlayerList';
import PlayerForm from './PlayerForm';
import BulkImport from './BulkImport';
import Pagination from './Pagination';
import { exportPlayersToPDF } from '../utils/pdfExport';

function Dashboard({ user, onLogout, hideNavbar = false, onSuccess: onSuccessCallback, onError: onErrorCallback }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load players on component mount
  useEffect(() => {
    loadPlayers();
  }, []);

  // Auto-hide messages after 3 seconds (only if not using parent callbacks)
  useEffect(() => {
    if (!onSuccessCallback && !onErrorCallback && (error || successMessage)) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, onSuccessCallback, onErrorCallback]);

  // Helper to show success message
  const showSuccess = (message) => {
    if (onSuccessCallback) {
      onSuccessCallback(message);
    } else {
      setSuccessMessage(message);
    }
  };

  // Helper to show error message
  const showError = (message) => {
    if (onErrorCallback) {
      onErrorCallback(message);
    } else {
      setError(message);
    }
  };

  /**
   * Load all players from API
   */
  const loadPlayers = async () => {
    try {
      setLoading(true);
      const response = await playersAPI.getAll();
      setPlayers(response.data.data);
    } catch (err) {
      showError('Failed to load players');
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
      if (!onErrorCallback) setError('');

      if (editingPlayer) {
        // Update existing player
        await playersAPI.update(editingPlayer.id, playerData);
        showSuccess('Player updated successfully!');
      } else {
        // Create new player
        await playersAPI.create(playerData);
        showSuccess('Player added successfully!');
      }

      // Reload players and close form
      await loadPlayers();
      setShowForm(false);
      setEditingPlayer(null);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save player');
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
    if (!onErrorCallback) setError('');
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async (player) => {
    if (!window.confirm(`Are you sure you want to delete ${player.player_name}?`)) {
      return;
    }

    try {
      if (!onErrorCallback) setError('');
      await playersAPI.delete(player.id);
      showSuccess('Player deleted successfully!');
      await loadPlayers();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete player');
      console.error('Delete player error:', err);
    }
  };

  /**
   * Handle search
   */
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  /**
   * Filter players based on search query
   */
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) {
      return players;
    }

    const query = searchQuery.toLowerCase();
    return players.filter(player => 
      player.player_name?.toLowerCase().includes(query) ||
      player.team_name?.toLowerCase().includes(query) ||
      player.position?.toLowerCase().includes(query)
    );
  }, [players, searchQuery]);

  /**
   * Get paginated players
   */
  const paginatedPlayers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPlayers.slice(startIndex, endIndex);
  }, [filteredPlayers, currentPage, pageSize]);

  /**
   * Handle page change
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Handle page size change
   */
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  };

  /**
   * Handle add new player button
   */
  const handleAddNew = () => {
    setEditingPlayer(null);
    setShowForm(true);
    if (!onErrorCallback) setError('');
  };

  /**
   * Handle cancel form
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPlayer(null);
    if (!onErrorCallback) setError('');
  };

  /**
   * Handle export to PDF
   */
  const handleExportPDF = () => {
    const exportData = searchQuery ? filteredPlayers : players;
    if (exportData.length === 0) {
      showError('No players to export');
      return;
    }
    const title = searchQuery ? `KPL Players - Search Results (${searchQuery})` : 'KPL Players List';
    exportPlayersToPDF(exportData, title);
    showSuccess(`${exportData.length} player(s) exported to PDF successfully!`);
  };

  /**
   * Handle bulk import completion
   */
  const handleBulkImportSuccess = async (message) => {
    showSuccess(message);
    await loadPlayers();
    setShowBulkImport(false);
  };

  return (
    <div className={hideNavbar ? '' : 'min-h-screen bg-gray-50'}>
      {!hideNavbar && <Navbar user={user} onLogout={onLogout} />}

      <div className={hideNavbar ? '' : 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'}>
        {/* Page Header */}
        <div className={hideNavbar ? '' : 'px-4 py-6 sm:px-0'}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Players</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage your player roster
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
              <button
                onClick={handleExportPDF}
                disabled={players.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to PDF"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Export PDF
              </button>
              <button
                onClick={() => setShowBulkImport(true)}
                className="inline-flex items-center px-4 py-2 border border-green-300 rounded-lg shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                title="Bulk Import"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Import
              </button>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Player
              </button>
            </div>
          </div>

          {/* Messages (only show if not using parent callbacks) */}
          {!onErrorCallback && error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-fadeIn">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!onSuccessCallback && successMessage && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded animate-fadeIn">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Search Bar with Stats */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by player name, team, or position..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  {filteredPlayers.length} result{filteredPlayers.length !== 1 ? 's' : ''}
                </div>
              )}
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

          {/* Bulk Import Modal */}
          {showBulkImport && (
            <BulkImport
              onClose={() => setShowBulkImport(false)}
              onSuccess={handleBulkImportSuccess}
            />
          )}

          {/* Players List */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <PlayerList
              players={paginatedPlayers}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
            />
            
            {/* Pagination */}
            {!loading && filteredPlayers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredPlayers.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>

          {/* No Results Message */}
          {!loading && searchQuery && filteredPlayers.length === 0 && (
            <div className="mt-4 text-center py-8 bg-white rounded-lg shadow">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No players found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No results for &ldquo;{searchQuery}&rdquo;. Try a different search term.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


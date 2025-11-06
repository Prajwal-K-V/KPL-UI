/**
 * GlobalPlayers Component
 * Manages players that are not assigned to any team
 */

import { useState, useEffect } from 'react';
import { playersAPI, teamsAPI } from '../services/api';
import PlayerForm from './PlayerForm';
import { exportGlobalPlayersToPDF } from '../utils/pdfExport';

function GlobalPlayers({ onSuccess, onError }) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [assigningPlayer, setAssigningPlayer] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [playersRes, teamsRes] = await Promise.all([
        playersAPI.getGlobal(),
        teamsAPI.getAll()
      ]);
      setPlayers(playersRes.data.data);
      setTeams(teamsRes.data.data);
    } catch (err) {
      if (onError) onError('Failed to load global players');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (playerData) => {
    try {
      setFormLoading(true);

      if (editingPlayer) {
        await playersAPI.update(editingPlayer.id, playerData);
        if (onSuccess) onSuccess('Player updated successfully!');
      } else {
        await playersAPI.create(playerData);
        if (onSuccess) onSuccess('Global player created successfully!');
      }

      await loadData();
      setShowForm(false);
      setEditingPlayer(null);
    } catch (err) {
      if (onError) onError(err.response?.data?.message || 'Failed to save player');
      console.error('Save error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAssignToTeam = async (player, teamId) => {
    try {
      await playersAPI.assignToTeam(player.id, teamId);
      if (onSuccess) onSuccess(`${player.player_name} assigned to team!`);
      await loadData();
      setAssigningPlayer(null);
    } catch (err) {
      if (onError) onError('Failed to assign player');
      console.error('Assign error:', err);
    }
  };

  const handleDelete = async (player) => {
    if (!window.confirm(`Delete ${player.player_name}?`)) return;

    try {
      await playersAPI.delete(player.id);
      if (onSuccess) onSuccess('Player deleted successfully!');
      await loadData();
    } catch (err) {
      if (onError) onError('Failed to delete player');
      console.error('Delete error:', err);
    }
  };

  const handleAddNew = () => {
    setEditingPlayer(null);
    setShowForm(true);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setShowForm(true);
  };

  const handleExportPDF = () => {
    if (players.length === 0) {
      if (onError) onError('No global players to export');
      return;
    }
    exportGlobalPlayersToPDF(players);
    if (onSuccess) onSuccess('Global players exported to PDF successfully!');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Global Player Pool</h3>
          <p className="mt-1 text-sm text-gray-600">
            Players not assigned to any team
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleExportPDF}
            disabled={players.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to PDF"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Global Player
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingPlayer ? 'Edit Player' : 'Add Global Player'}
          </h4>
          <PlayerForm
            player={editingPlayer}
            teams={teams}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPlayer(null);
            }}
            isLoading={formLoading}
          />
        </div>
      )}

      {/* Players Grid */}
      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No global players yet</h3>
          <p className="text-gray-600">Create players here and assign them to teams later</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{player.player_name}</h4>
                  {player.position && (
                    <p className="text-sm text-gray-600">{player.position}</p>
                  )}
                  {player.jersey_number && (
                    <span className="inline-flex items-center px-2 py-1 mt-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      #{player.jersey_number}
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(player)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(player)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Assign to Team */}
              {assigningPlayer === player.id ? (
                <div className="mt-3 space-y-2">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAssignToTeam(player, parseInt(e.target.value));
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Select team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.team_logo} {team.team_name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setAssigningPlayer(null)}
                    className="w-full px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAssigningPlayer(player.id)}
                  className="w-full mt-3 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Assign to Team
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && players.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600">
          {players.length} global player{players.length !== 1 ? 's' : ''} available
        </div>
      )}
    </div>
  );
}

export default GlobalPlayers;


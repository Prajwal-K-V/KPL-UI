/**
 * TeamHierarchy Component
 * Displays team details with player hierarchy
 */

import { useState, useEffect } from 'react';
import { teamsAPI, playersAPI } from '../services/api';
import PlayerForm from './PlayerForm';
import { exportTeamPlayersToPDF } from '../utils/pdfExport';

function TeamHierarchy({ teamId, onBack, onSuccess }) {
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [globalPlayers, setGlobalPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [showGlobalPlayers, setShowGlobalPlayers] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeamHierarchy();
  }, [teamId]);

  const loadTeamHierarchy = async () => {
    try {
      setLoading(true);
      const [hierarchyRes, globalRes] = await Promise.all([
        teamsAPI.getHierarchy(teamId),
        playersAPI.getGlobal()
      ]);
      setTeam(hierarchyRes.data.data);
      setPlayers(hierarchyRes.data.data.players || []);
      setGlobalPlayers(globalRes.data.data);
    } catch (err) {
      setError('Failed to load team details');
      console.error('Load team hierarchy error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = () => {
    setEditingPlayer(null);
    setShowPlayerForm(true);
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer(player);
    setShowPlayerForm(true);
  };

  const handleDeletePlayer = async (player) => {
    if (!window.confirm(`Are you sure you want to remove ${player.player_name} from the team?`)) {
      return;
    }

    try {
      await playersAPI.delete(player.id);
      await loadTeamHierarchy();
      if (onSuccess) onSuccess('Player removed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete player');
      console.error('Delete player error:', err);
    }
  };

  const handlePlayerFormSubmit = async (playerData) => {
    try {
      setFormLoading(true);
      setError('');

      // Add team_id to player data
      const dataWithTeam = { ...playerData, team_id: teamId };

      if (editingPlayer) {
        await playersAPI.update(editingPlayer.id, dataWithTeam);
        if (onSuccess) onSuccess('Player updated successfully!');
      } else {
        await playersAPI.create(dataWithTeam);
        if (onSuccess) onSuccess('Player added successfully!');
      }

      await loadTeamHierarchy();
      setShowPlayerForm(false);
      setEditingPlayer(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save player');
      console.error('Save player error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelPlayerForm = () => {
    setShowPlayerForm(false);
    setEditingPlayer(null);
    setError('');
  };

  const handleAssignGlobalPlayer = async (player) => {
    try {
      await playersAPI.assignToTeam(player.id, teamId);
      await loadTeamHierarchy();
      if (onSuccess) onSuccess(`${player.player_name} added to team!`);
    } catch (err) {
      setError('Failed to assign player');
      console.error('Assign player error:', err);
    }
  };

  const handleRemoveFromTeam = async (player) => {
    if (!window.confirm(`Remove ${player.player_name} from team? They will become a global player.`)) {
      return;
    }

    try {
      await playersAPI.unassignFromTeam(player.id);
      await loadTeamHierarchy();
      if (onSuccess) onSuccess('Player removed from team!');
    } catch (err) {
      setError('Failed to remove player');
      console.error('Remove player error:', err);
    }
  };

  const handleExportPDF = () => {
    if (!team) return;
    exportTeamPlayersToPDF(team, players);
    if (onSuccess) onSuccess('Team roster exported to PDF successfully!');
  };

  // Group players by position
  const playersByPosition = players.reduce((acc, player) => {
    const position = player.position || 'Unassigned';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Team not found</p>
        <button onClick={onBack} className="mt-4 text-primary-600 hover:text-primary-700">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Teams
        </button>

        <div 
          className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg p-8 border-l-8"
          style={{ borderLeftColor: team.team_color }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-5xl shadow-xl"
                style={{ backgroundColor: `${team.team_color}15` }}
              >
                {team.team_logo}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{team.team_name}</h1>
                {team.description && (
                  <p className="text-gray-600">{team.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {players.length} {players.length === 1 ? 'Player' : 'Players'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
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
                onClick={handleAddPlayer}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Player
              </button>
              {globalPlayers.length > 0 && (
                <button
                  onClick={() => setShowGlobalPlayers(!showGlobalPlayers)}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Assign Global Player ({globalPlayers.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-fadeIn">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Player Form */}
      {showPlayerForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-lg border border-gray-200 animate-fadeIn">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingPlayer ? 'Edit Player' : 'Add New Player'}
          </h3>
          <PlayerForm
            player={editingPlayer}
            onSubmit={handlePlayerFormSubmit}
            onCancel={handleCancelPlayerForm}
            isLoading={formLoading}
            hideTeamSelect={true}
          />
        </div>
      )}

      {/* Global Players Selection */}
      {showGlobalPlayers && globalPlayers.length > 0 && (
        <div className="mb-8 bg-green-50 p-6 rounded-lg shadow-lg border-2 border-green-200 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Assign Global Player to {team.team_name}
            </h3>
            <button
              onClick={() => setShowGlobalPlayers(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {globalPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => handleAssignGlobalPlayer(player)}
                className="text-left p-4 bg-white rounded-lg hover:bg-green-100 transition-colors border border-green-200 hover:border-green-400"
              >
                <p className="font-semibold text-gray-900">{player.player_name}</p>
                {player.position && (
                  <p className="text-sm text-gray-600">{player.position}</p>
                )}
                {player.jersey_number && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 rounded">
                    #{player.jersey_number}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Players List */}
      {players.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No players yet</h3>
          <p className="text-gray-600 mb-6">Start building your team by adding players!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(playersByPosition).map(([position, positionPlayers]) => (
            <div key={position} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div 
                className="px-6 py-3 text-white font-semibold text-lg"
                style={{ backgroundColor: team.team_color }}
              >
                {position}
              </div>
              <div className="divide-y divide-gray-200">
                {positionPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-4">
                      {player.jersey_number && (
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-md"
                          style={{ backgroundColor: team.team_color }}
                        >
                          {player.jersey_number}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{player.player_name}</p>
                        <p className="text-sm text-gray-500">{position}</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditPlayer(player)}
                        className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                        title="Edit player"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveFromTeam(player)}
                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        title="Remove from team"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete player"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TeamHierarchy;


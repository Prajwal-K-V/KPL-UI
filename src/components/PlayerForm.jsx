/**
 * PlayerForm Component
 * Form for adding and editing players
 */

import { useState, useEffect } from 'react';
import { teamsAPI } from '../services/api';

function PlayerForm({ player, teams, onSubmit, onCancel, isLoading, hideTeamSelect }) {
  const [playerName, setPlayerName] = useState('');
  const [position, setPosition] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [teamId, setTeamId] = useState('');
  const [availableTeams, setAvailableTeams] = useState(teams || []);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // Load teams if not provided
  useEffect(() => {
    if (!teams && !hideTeamSelect) {
      loadTeams();
    }
  }, [teams, hideTeamSelect]);

  // Populate form if editing existing player
  useEffect(() => {
    if (player) {
      setPlayerName(player.player_name || '');
      setPosition(player.position || '');
      setJerseyNumber(player.jersey_number || '');
      setTeamId(player.team_id || '');
    }
  }, [player]);

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await teamsAPI.getAll();
      setAvailableTeams(response.data.data);
    } catch (err) {
      console.error('Load teams error:', err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!playerName.trim()) {
      return;
    }

    // Call parent submit handler
    onSubmit({
      player_name: playerName.trim(),
      position: position.trim() || null,
      jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
      team_id: teamId ? parseInt(teamId) : null, // Allow null for global players
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
            Player Name *
          </label>
          <input
            id="playerName"
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="Enter player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {!hideTeamSelect && (
          <div className="md:col-span-2">
            <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">
              Team {!player && <span className="text-gray-500 text-xs">(Optional - leave empty for global player)</span>}
            </label>
            <select
              id="teamId"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={isLoading || loadingTeams}
            >
              <option value="">No Team (Global Player)</option>
              {availableTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.team_logo} {team.team_name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <input
            id="position"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="e.g., Forward, Goalkeeper"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="jerseyNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Jersey Number
          </label>
          <input
            id="jerseyNumber"
            type="number"
            min="0"
            max="999"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            placeholder="e.g., 10"
            value={jerseyNumber}
            onChange={(e) => setJerseyNumber(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex space-x-3 pt-2">
        <button
          type="submit"
          disabled={isLoading || loadingTeams}
          className="flex-1 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? 'Saving...' : player ? 'Update Player' : 'Add Player'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default PlayerForm;


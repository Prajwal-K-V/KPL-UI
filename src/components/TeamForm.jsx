/**
 * TeamForm Component
 * Form for adding and editing teams
 */

import { useState, useEffect } from 'react';

// Common team emojis
const TEAM_LOGOS = ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏒', '🏏', '🥊', '⛳', '🎯', '🏆', '🥇', '⭐', '🔥', '💎'];

// Color palette
const TEAM_COLORS = [
  { name: 'Blue', value: '#0ea5e9' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Rose', value: '#f43f5e' },
];

function TeamForm({ team, onSubmit, onCancel, isLoading }) {
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('⚽');
  const [teamColor, setTeamColor] = useState('#0ea5e9');
  const [description, setDescription] = useState('');

  // Populate form if editing existing team
  useEffect(() => {
    if (team) {
      setTeamName(team.team_name || '');
      setTeamLogo(team.team_logo || '⚽');
      setTeamColor(team.team_color || '#0ea5e9');
      setDescription(team.description || '');
    }
  }, [team]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!teamName.trim()) {
      return;
    }

    // Call parent submit handler
    onSubmit({
      team_name: teamName.trim(),
      team_logo: teamLogo,
      team_color: teamColor,
      description: description.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team Name */}
      <div>
        <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
          Team Name *
        </label>
        <input
          id="teamName"
          type="text"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          placeholder="Enter team name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Team Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Team Logo
        </label>
        <div className="grid grid-cols-8 gap-2">
          {TEAM_LOGOS.map((logo) => (
            <button
              key={logo}
              type="button"
              onClick={() => setTeamLogo(logo)}
              className={`w-12 h-12 rounded-lg text-2xl flex items-center justify-center transition-all ${
                teamLogo === logo
                  ? 'bg-primary-100 ring-2 ring-primary-500 scale-110'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              disabled={isLoading}
            >
              {logo}
            </button>
          ))}
        </div>
      </div>

      {/* Team Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Team Color
        </label>
        <div className="grid grid-cols-6 gap-3">
          {TEAM_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setTeamColor(color.value)}
              className={`relative h-12 rounded-lg transition-all ${
                teamColor === color.value
                  ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
              disabled={isLoading}
            >
              {teamColor === color.value && (
                <svg className="absolute inset-0 m-auto w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
          placeholder="Enter team description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Preview */}
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200">
        <p className="text-xs font-medium text-gray-500 mb-2">Preview:</p>
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm"
            style={{ backgroundColor: `${teamColor}15` }}
          >
            {teamLogo}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{teamName || 'Team Name'}</p>
            <div 
              className="w-20 h-1 rounded-full mt-1"
              style={{ backgroundColor: teamColor }}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex space-x-3 pt-2">
        <button
          type="submit"
          disabled={isLoading || !teamName.trim()}
          className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TeamForm;


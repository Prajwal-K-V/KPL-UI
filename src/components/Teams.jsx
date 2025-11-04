/**
 * Teams Component
 * Main component for managing teams
 */

import { useState, useEffect } from 'react';
import { teamsAPI } from '../services/api';
import TeamGrid from './TeamGrid';
import TeamForm from './TeamForm';
import TeamHierarchy from './TeamHierarchy';
import GlobalPlayers from './GlobalPlayers';

function Teams({ onSuccess, onError }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [activeTab, setActiveTab] = useState('teams'); // 'teams' or 'global'

  // Load teams on component mount
  useEffect(() => {
    loadTeams();
  }, []);

  /**
   * Load all teams from API
   */
  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getAll();
      setTeams(response.data.data);
    } catch (err) {
      if (onError) onError('Failed to load teams');
      console.error('Load teams error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission (add or update team)
   */
  const handleFormSubmit = async (teamData) => {
    try {
      setFormLoading(true);

      if (editingTeam) {
        // Update existing team
        await teamsAPI.update(editingTeam.id, teamData);
        if (onSuccess) onSuccess('Team updated successfully!');
      } else {
        // Create new team
        await teamsAPI.create(teamData);
        if (onSuccess) onSuccess('Team created successfully!');
      }

      // Reload teams and close form
      await loadTeams();
      setShowForm(false);
      setEditingTeam(null);
    } catch (err) {
      if (onError) onError(err.response?.data?.message || 'Failed to save team');
      console.error('Save team error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Handle team card click - show hierarchy
   */
  const handleTeamClick = (team) => {
    setSelectedTeamId(team.id);
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (team) => {
    setEditingTeam(team);
    setShowForm(true);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async (team) => {
    if (!window.confirm(`Are you sure you want to delete ${team.team_name}? This will also delete all players in this team.`)) {
      return;
    }

    try {
      await teamsAPI.delete(team.id);
      if (onSuccess) onSuccess('Team deleted successfully!');
      await loadTeams();
    } catch (err) {
      if (onError) onError(err.response?.data?.message || 'Failed to delete team');
      console.error('Delete team error:', err);
    }
  };

  /**
   * Handle add new team button
   */
  const handleAddNew = () => {
    setEditingTeam(null);
    setShowForm(true);
  };

  /**
   * Handle cancel form
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTeam(null);
  };

  /**
   * Handle back from team hierarchy
   */
  const handleBackFromHierarchy = () => {
    setSelectedTeamId(null);
    loadTeams(); // Reload to update player counts
  };

  // If viewing a specific team, show hierarchy
  if (selectedTeamId) {
    return (
      <TeamHierarchy
        teamId={selectedTeamId}
        onBack={handleBackFromHierarchy}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('teams')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'teams'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('global')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'global'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Global Players
          </button>
        </nav>
      </div>

      {activeTab === 'teams' ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Teams</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage your teams and players
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Team
            </button>
          </div>

      {/* Form Modal */}
      {showForm && (
        <div className="mb-8 bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 animate-fadeIn">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {editingTeam ? 'Edit Team' : 'Create New Team'}
          </h3>
          <TeamForm
            team={editingTeam}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            isLoading={formLoading}
          />
        </div>
      )}

      {/* Teams Grid */}
      <TeamGrid
        teams={teams}
        onTeamClick={handleTeamClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />

          {/* Stats Footer */}
          {!loading && teams.length > 0 && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-6 bg-white px-8 py-4 rounded-full shadow-md">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{teams.length}</p>
                  <p className="text-sm text-gray-600">Total Teams</p>
                </div>
                <div className="w-px h-10 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {teams.reduce((sum, team) => sum + (team.player_count || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Players</p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <GlobalPlayers onSuccess={onSuccess} onError={onError} />
      )}
    </div>
  );
}

export default Teams;


/**
 * Bulk Import Utility
 * Helper function to import multiple players at once
 */

import { playersAPI } from '../services/api';

/**
 * Import players in bulk
 * @param {Array} players - Array of player objects {name, position, team_id}
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Object} Results of the import
 */
export const bulkImportPlayers = async (players, onProgress) => {
  const results = {
    success: [],
    failed: [],
    total: players.length
  };

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    try {
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: players.length,
          player: player.name
        });
      }

      await playersAPI.create({
        player_name: player.name,
        position: player.position || 'Player',
        jersey_number: player.jersey_number || null,
        team_id: player.team_id || null
      });

      results.success.push(player.name);
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to import ${player.name}:`, error);
      results.failed.push({
        name: player.name,
        error: error.response?.data?.message || error.message
      });
    }
  }

  return results;
};

/**
 * Parse player data from text format
 * Format: "Name position" or just "Name"
 * @param {string} text - Multi-line text with player data
 * @returns {Array} Array of player objects
 */
export const parsePlayerText = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  const players = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Extract name and position
    let name, position;
    
    // Check for position keywords at the end
    const positionKeywords = [
      { pattern: /batsman$/i, position: 'Batsman' },
      { pattern: /bowler$/i, position: 'Bowler' },
      { pattern: /batting all rounder$/i, position: 'Batting All Rounder' },
      { pattern: /bowling all rounder$/i, position: 'Bowling All Rounder' },
      { pattern: /all rounder$/i, position: 'All Rounder' },
      { pattern: /wicket keeper$/i, position: 'Wicket Keeper' },
      { pattern: /wicketkeeper$/i, position: 'Wicket Keeper' }
    ];

    let foundPosition = false;
    for (const { pattern, position: pos } of positionKeywords) {
      if (pattern.test(trimmed)) {
        position = pos;
        name = trimmed.replace(pattern, '').trim();
        foundPosition = true;
        break;
      }
    }

    if (!foundPosition) {
      name = trimmed;
      position = 'Player';
    }

    players.push({
      name,
      position,
      jersey_number: null,
      team_id: null
    });
  }

  return players;
};


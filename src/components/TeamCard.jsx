/**
 * TeamCard Component
 * Modern card component for displaying team information
 */

function TeamCard({ team, onClick, onEdit, onDelete }) {
  const handleClick = (e) => {
    // Don't trigger card click when clicking action buttons
    if (e.target.closest('.action-button')) {
      return;
    }
    onClick(team);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(team);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(team);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1"
      style={{ borderTop: `6px solid ${team.team_color || '#0ea5e9'}` }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${team.team_color || '#0ea5e9'} 0%, transparent 100%)` }}
      />
      
      {/* Card content */}
      <div className="relative p-6">
        {/* Team logo and name */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: `${team.team_color || '#0ea5e9'}15` }}
            >
              {team.team_logo || '⚽'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                {team.team_name}
              </h3>
              <p className="text-sm text-gray-500">
                {team.player_count || 0} {team.player_count === 1 ? 'Player' : 'Players'}
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleEdit}
              className="action-button p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
              title="Edit team"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="action-button p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Delete team"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Description */}
        {team.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {team.description}
          </p>
        )}

        {/* View details button */}
        <button className="w-full py-2 px-4 bg-gray-50 group-hover:bg-primary-50 text-gray-700 group-hover:text-primary-700 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2">
          <span>View Team</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TeamCard;


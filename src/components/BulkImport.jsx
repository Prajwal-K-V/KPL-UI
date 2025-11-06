/**
 * BulkImport Component
 * Allows importing multiple players at once
 */

import { useState } from 'react';
import { bulkImportPlayers, parsePlayerText } from '../utils/bulkImport';

function BulkImport({ onClose, onSuccess }) {
  const [playerText, setPlayerText] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);

  const handleImport = async () => {
    if (!playerText.trim()) return;

    setImporting(true);
    setResults(null);

    try {
      const players = parsePlayerText(playerText);
      
      if (players.length === 0) {
        alert('No valid player data found');
        setImporting(false);
        return;
      }

      const importResults = await bulkImportPlayers(players, (progressInfo) => {
        setProgress(progressInfo);
      });

      setResults(importResults);
      
      if (importResults.success.length > 0) {
        if (onSuccess) {
          onSuccess(`Successfully imported ${importResults.success.length} player(s)!`);
        }
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      alert('Failed to import players. Please try again.');
    } finally {
      setImporting(false);
      setProgress(null);
    }
  };

  const handleClose = () => {
    if (!importing && onClose) {
      onClose();
    }
  };

  const exampleText = `Manju harathalu
Abhi harathalu
Subramanya K
Bhaskar J
Ajay humcha
Naga mgudde
Punith
Kumara
Sharath mattimane
Sujaya batting all rounder
Gani batting all rounder
Venki batsman
Sonu batsman
Mithun batsman
Gagan bowler`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">
              📥 Bulk Import Players
            </h3>
            <button
              onClick={handleClose}
              disabled={importing}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!results ? (
            <>
              {/* Instructions */}
              <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Instructions:</strong> Enter player names, one per line. Add position after the name if specified.
                  <br />
                  Format: <code className="bg-blue-100 px-1 rounded">Name position</code> or just <code className="bg-blue-100 px-1 rounded">Name</code>
                </p>
              </div>

              {/* Example Button */}
              <button
                onClick={() => setPlayerText(exampleText)}
                className="mb-3 text-sm text-primary-600 hover:text-primary-700 underline"
                disabled={importing}
              >
                Load example data
              </button>

              {/* Text Area */}
              <textarea
                value={playerText}
                onChange={(e) => setPlayerText(e.target.value)}
                disabled={importing}
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm disabled:bg-gray-100"
                placeholder={exampleText}
              />

              {/* Progress */}
              {importing && progress && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Importing: {progress.player}</span>
                    <span>{progress.current} of {progress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleImport}
                  disabled={importing || !playerText.trim()}
                  className="flex-1 py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {importing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    'Import Players'
                  )}
                </button>
                <button
                  onClick={handleClose}
                  disabled={importing}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="space-y-4">
                {/* Success */}
                {results.success.length > 0 && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-green-800 font-semibold">
                        Successfully imported {results.success.length} player(s)
                      </h4>
                    </div>
                    <ul className="text-sm text-green-700 ml-7 space-y-1">
                      {results.success.map((name, idx) => (
                        <li key={idx}>✓ {name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Failed */}
                {results.failed.length > 0 && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-red-800 font-semibold">
                        Failed to import {results.failed.length} player(s)
                      </h4>
                    </div>
                    <ul className="text-sm text-red-700 ml-7 space-y-1">
                      {results.failed.map((item, idx) => (
                        <li key={idx}>✗ {item.name}: {item.error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-all duration-200"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BulkImport;


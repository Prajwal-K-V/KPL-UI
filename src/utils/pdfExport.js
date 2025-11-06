/**
 * PDF Export Utility
 * Functions for exporting player data to PDF
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export all players to PDF
 * @param {Array} players - Array of player objects
 * @param {string} title - Document title
 */
export const exportPlayersToPDF = (players, title = 'KPL Players List') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated on: ${date}`, 14, 28);
  
  // Add summary
  doc.setFontSize(11);
  doc.text(`Total Players: ${players.length}`, 14, 35);
  
  // Prepare table data
  const tableData = players.map((player, index) => [
    index + 1,
    player.player_name,
    player.team_name || 'Global Player',
    player.position || '-',
    player.jersey_number || '-'
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 42,
    head: [['#', 'Player Name', 'Team', 'Position', 'Jersey']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246], // Primary blue
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10,
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 60 },
      2: { cellWidth: 50 },
      3: { cellWidth: 35 },
      4: { halign: 'center', cellWidth: 25 }
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save PDF
  const fileName = `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

/**
 * Export team players to PDF
 * @param {Object} team - Team object with players
 */
export const exportTeamPlayersToPDF = (team, players) => {
  const doc = new jsPDF();
  
  // Add team header with color
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
  
  // Add team info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${team.team_logo || '🏆'} ${team.team_name}`, 14, 18);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  if (team.team_description) {
    doc.text(team.team_description.substring(0, 80), 14, 28);
  }
  
  // Add date and player count
  doc.setFontSize(10);
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated: ${date} | Players: ${players.length}`, 14, 35);
  
  // Reset text color for content
  doc.setTextColor(0, 0, 0);
  
  // Group players by position
  const playersByPosition = players.reduce((acc, player) => {
    const position = player.position || 'Unassigned';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(player);
    return acc;
  }, {});
  
  let startY = 48;
  
  // Add players grouped by position
  Object.entries(playersByPosition).forEach(([position, posPlayers]) => {
    // Position header
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text(`${position} (${posPlayers.length})`, 14, startY);
    startY += 2;
    
    doc.setTextColor(0, 0, 0);
    
    // Prepare table data
    const tableData = posPlayers.map((player, index) => [
      index + 1,
      player.player_name,
      player.jersey_number || '-'
    ]);
    
    // Add table for this position
    autoTable(doc, {
      startY: startY,
      head: [['#', 'Player Name', 'Jersey']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [229, 231, 235],
        textColor: [0, 0, 0],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 140 },
        2: { halign: 'center', cellWidth: 30 }
      },
      margin: { left: 14, right: 14 }
    });
    
    startY = doc.lastAutoTable.finalY + 8;
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(
      `${team.team_name} Roster - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save PDF
  const fileName = `${team.team_name.replace(/\s+/g, '_')}_Roster_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

/**
 * Export global players to PDF
 * @param {Array} players - Array of global player objects
 */
export const exportGlobalPlayersToPDF = (players) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // Green color for global
  doc.text('🌍 Global Player Pool', 14, 20);
  
  // Add subtitle
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Available players without team assignment', 14, 28);
  
  // Add date
  doc.setFontSize(10);
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated on: ${date}`, 14, 35);
  
  // Add summary
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Total Available Players: ${players.length}`, 14, 42);
  
  // Prepare table data
  const tableData = players.map((player, index) => [
    index + 1,
    player.player_name,
    player.position || '-',
    player.jersey_number || '-'
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 50,
    head: [['#', 'Player Name', 'Position', 'Jersey Number']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94], // Green
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10,
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 90 },
      2: { cellWidth: 50 },
      3: { halign: 'center', cellWidth: 30 }
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244]
    }
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(
      `Global Players - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save PDF
  const fileName = `Global_Players_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};

/**
 * Export all teams with their players to PDF
 * @param {Array} teams - Array of team objects with player counts
 */
export const exportAllTeamsToPDF = (teams) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('KPL Teams Overview', 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(`Generated on: ${date}`, 14, 28);
  
  // Add summary
  doc.setFontSize(11);
  const totalPlayers = teams.reduce((sum, team) => sum + (team.player_count || 0), 0);
  doc.text(`Total Teams: ${teams.length} | Total Players: ${totalPlayers}`, 14, 35);
  
  // Prepare table data
  const tableData = teams.map((team, index) => [
    index + 1,
    `${team.team_logo || ''} ${team.team_name}`,
    team.player_count || 0,
    team.team_description ? team.team_description.substring(0, 50) + (team.team_description.length > 50 ? '...' : '') : '-'
  ]);
  
  // Add table
  autoTable(doc, {
    startY: 42,
    head: [['#', 'Team Name', 'Players', 'Description']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10,
      halign: 'left'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 50 },
      2: { halign: 'center', cellWidth: 20 },
      3: { cellWidth: 105 }
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    }
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Save PDF
  const fileName = `KPL_Teams_Overview_${new Date().getTime()}.pdf`;
  doc.save(fileName);
};


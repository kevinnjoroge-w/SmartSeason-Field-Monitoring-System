import React from 'react';

export const StatusBadge = ({ status }) => {
  // Custom styled badges based on rules: green for Active, red for At Risk, gray for Completed
  
  let bgClass = '';
  let textClass = '';
  let borderClass = '';

  switch (status) {
    case 'Active':
      bgClass = 'bg-status-active-bg';
      textClass = 'text-status-active';
      borderClass = 'border-status-active/30';
      break;
    case 'At Risk':
      bgClass = 'bg-status-risk-bg';
      textClass = 'text-status-risk';
      borderClass = 'border-status-risk/30';
      break;
    case 'Completed':
      bgClass = 'bg-status-completed-bg';
      textClass = 'text-status-completed';
      borderClass = 'border-status-completed/30';
      break;
    default:
      bgClass = 'bg-earth-200';
      textClass = 'text-earth-800';
      borderClass = 'border-earth-600/30';
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${bgClass} ${textClass} ${borderClass}`}>
      {status}
    </span>
  );
};

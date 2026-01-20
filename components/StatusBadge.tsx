
import React from 'react';

interface StatusBadgeProps {
  icon: string;
  label: string;
  color: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ icon, label, color }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} mr-2 mb-2`}>
      <i className={`${icon} mr-1.5`}></i>
      {label}
    </span>
  );
};

export default StatusBadge;

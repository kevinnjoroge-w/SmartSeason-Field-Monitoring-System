import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, colorClass = "text-earth-600" }) => {
  return (
    <div className="bg-white border border-earth-200 rounded-xl p-6 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-earth-600 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-earth-800">{value}</h3>
        {subtitle && (
          <p className="text-sm text-earth-600 mt-2">{subtitle}</p>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg bg-earth-100 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

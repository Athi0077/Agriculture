import React from 'react';

export default function StatCard({ title, value, icon }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}

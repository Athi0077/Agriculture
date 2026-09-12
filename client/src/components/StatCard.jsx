import React from 'react';

export default function StatCard({ title, value, icon, loading }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-info" style={{ width: '100%' }}>
        <span className="stat-label">{title}</span>
        {loading ? (
          <div className="skeleton skeleton-title" style={{ marginTop: '4px', width: '60px' }}></div>
        ) : (
          <span className="stat-value">{value}</span>
        )}
      </div>
    </div>
  );
}

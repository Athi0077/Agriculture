import React from 'react';
import './RecommendationList.css';

const RecommendationItem = ({ rec }) => {
  const { priority, category, title, description, reason, productQuery } = rec;
  
  let badgeColor = '#4CAF50';
  if (priority === 'MEDIUM') badgeColor = '#FFC107';
  if (priority === 'HIGH') badgeColor = '#FF9800';
  if (priority === 'CRITICAL') badgeColor = '#F44336';

  return (
    <div className={`recommendation-item priority-${priority.toLowerCase()}`}>
      <div className="rec-header">
        <span className="rec-badge" style={{ backgroundColor: badgeColor + '20', color: badgeColor, border: `1px solid ${badgeColor}40` }}>
          {priority}
        </span>
        <span className="rec-category">{category}</span>
      </div>
      <h4 className="rec-title">{title}</h4>
      <p className="rec-description">{description}</p>
      {reason && <p className="rec-reason"><i className="fa-solid fa-circle-info"></i> {reason}</p>}
      
      {productQuery && (
        <a 
          href={`https://www.amazon.com/s?k=${encodeURIComponent(productQuery + ' agricultural treatment')}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '15px', fontSize: '0.9rem', padding: '8px 16px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          Find Treatment Online
        </a>
      )}
    </div>
  );
};

const RecommendationList = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="recommendation-list-container">
      <h3 className="rec-list-title">Actionable Recommendations</h3>
      <div className="rec-grid">
        {recommendations.map((rec, index) => (
          <RecommendationItem key={index} rec={rec} />
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;

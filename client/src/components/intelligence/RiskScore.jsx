import React from 'react';
import './RiskScore.css';

const RiskScore = ({ score, level }) => {
  // Determine color based on level
  let color = '#4CAF50'; // Low - Green
  if (level === 'Moderate') color = '#FFC107'; // Yellow
  if (level === 'High') color = '#FF9800'; // Orange
  if (level === 'Critical') color = '#F44336'; // Red

  // Calculate SVG circle properties
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="risk-score-container">
      <div className="risk-score-circle-wrapper">
        <svg className="risk-score-svg" width="160" height="160">
          <circle
            className="risk-score-bg"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="transparent"
            r={radius}
            cx="80"
            cy="80"
          />
          <circle
            className="risk-score-progress"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="80"
            cy="80"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="risk-score-text-wrapper">
          <span className="risk-score-number" style={{ color }}>{score}</span>
          <span className="risk-score-label">/100</span>
        </div>
      </div>
      <div className="risk-score-level">
        <span className="level-badge" style={{ backgroundColor: color + '20', color: color, border: `1px solid ${color}40`, whiteSpace: 'nowrap' }}>
          {level} Risk
        </span>
      </div>
    </div>
  );
};

export default RiskScore;

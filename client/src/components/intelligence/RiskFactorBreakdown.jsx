import React from 'react';
import './RiskFactorBreakdown.css';

const FactorBar = ({ label, value, max, color }) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="factor-row">
      <div className="factor-label">{label}</div>
      <div className="factor-bar-container">
        <div className="factor-bar-bg">
          <div 
            className="factor-bar-fill" 
            style={{ 
              width: `${Math.max(0, Math.min(percentage, 100))}%`, 
              backgroundColor: color 
            }}
          ></div>
        </div>
      </div>
      <div className="factor-value">
        {value}<span className="factor-max">/{max}</span>
      </div>
    </div>
  );
};

const RiskFactorBreakdown = ({ breakdown }) => {
  if (!breakdown) return null;

  return (
    <div className="risk-factor-breakdown">
      <h3 className="breakdown-title">Risk Factor Breakdown</h3>
      <div className="breakdown-list">
        <FactorBar label="AI Analysis" value={breakdown.aiAnalysis || 0} max={40} color="#8b5cf6" />
        <FactorBar label="Weather" value={breakdown.weather || 0} max={25} color="#3b82f6" />
        <FactorBar label="Crop Stage" value={breakdown.cropStage || 0} max={10} color="#10b981" />
        <FactorBar label="Soil" value={breakdown.soil || 0} max={10} color="#f59e0b" />
        <FactorBar label="History" value={breakdown.history || 0} max={10} color="#ef4444" />
        <FactorBar label="Variety" value={breakdown.variety || 0} max={5} color="#6b7280" />
      </div>
    </div>
  );
};

export default RiskFactorBreakdown;

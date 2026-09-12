import React from 'react';
import './CropHealthSummary.css';

const CropHealthSummary = ({ latestScan, loading }) => {
  if (loading) {
    return (
      <div className="card crop-health-summary">
        <h3 className="h4 mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Dashboard Intelligence</h3>
        
        <div className="summary-grid">
          <div className="summary-item main-risk">
            <div className="summary-label">Risk Score</div>
            <div className="skeleton skeleton-title" style={{ height: '3rem', width: '50%' }}></div>
          </div>

          <div className="summary-item">
            <div className="summary-label">AI Diagnosis</div>
            <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
          </div>

          <div className="summary-item">
            <div className="summary-label">Environmental Risk</div>
            <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
          </div>

          <div className="summary-item">
            <div className="summary-label">Local Disease Activity</div>
            <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="top-drivers-section mt-4">
          <h4 className="h5 mb-2" style={{ color: 'var(--text-color)' }}>Top Risk Drivers</h4>
          <ul className="drivers-list-small">
            <li><div className="skeleton skeleton-text" style={{ width: '70%' }}></div></li>
            <li><div className="skeleton skeleton-text" style={{ width: '85%' }}></div></li>
            <li><div className="skeleton skeleton-text" style={{ width: '60%' }}></div></li>
          </ul>
        </div>
      </div>
    );
  }

  if (!latestScan) {
    return (
      <div className="card crop-health-summary">
        <h3 className="h4 mb-4">Overall Crop Health</h3>
        <p className="text-muted">No scan data available yet.</p>
      </div>
    );
  }

  const { riskScore, riskLevel, diagnosis, confidence, weatherData, history } = latestScan;
  
  // Parse drivers from explanations if available, else use a placeholder
  const topDrivers = [];
  if (latestScan.factorBreakdown) {
    const { weather, cropStage, history: histScore, aiAnalysis } = latestScan.factorBreakdown;
    if (weather > 15) topDrivers.push("Favorable environmental conditions for disease");
    if (cropStage > 5) topDrivers.push("Vulnerable crop stage");
    if (histScore > 5) topDrivers.push("High local disease activity");
    if (aiAnalysis > 20) topDrivers.push("Disease symptoms detected by AI");
  }

  let riskColor = '#4CAF50';
  if (riskLevel === 'Moderate') riskColor = '#FFC107';
  if (riskLevel === 'High') riskColor = '#FF9800';
  if (riskLevel === 'Critical') riskColor = '#F44336';

  return (
    <div className="card crop-health-summary">
      <h3 className="h4 mb-4" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Dashboard Intelligence</h3>
      
      <div className="summary-grid">
        <div className="summary-item main-risk">
          <div className="summary-label">Risk Score</div>
          <div className="summary-value risk-score-display" style={{ color: riskColor }}>
            {riskScore || 0} <span className="risk-level-badge" style={{ backgroundColor: riskColor + '20' }}>{riskLevel} Risk</span>
          </div>
        </div>

        <div className="summary-item">
          <div className="summary-label">AI Diagnosis</div>
          <div className="summary-value">{diagnosis || 'N/A'}</div>
          <div className="summary-subtext">Confidence: {confidence || 0}%</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Environmental Risk</div>
          <div className="summary-value">{latestScan.factorBreakdown?.weather > 15 ? 'High' : (latestScan.factorBreakdown?.weather > 5 ? 'Moderate' : 'Low')}</div>
        </div>

        <div className="summary-item">
          <div className="summary-label">Local Disease Activity</div>
          <div className="summary-value">{history?.historicalRisk || 'Unknown'}</div>
        </div>
      </div>

      {topDrivers.length > 0 && (
        <div className="top-drivers-section mt-4">
          <h4 className="h5 mb-2" style={{ color: 'var(--text-color)' }}>Top Risk Drivers</h4>
          <ul className="drivers-list-small">
            {topDrivers.map((driver, idx) => (
              <li key={idx}>• {driver}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CropHealthSummary;

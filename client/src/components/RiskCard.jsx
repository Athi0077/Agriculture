import React from 'react';

export default function RiskCard({ score, factors }) {
  return (
    <div className="card">
      <h2 className="h3" style={{ marginBottom: '1.5rem' }}>Overall Crop Risk</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div className="circular-progress" style={{ width: '80px', height: '80px', background: `conic-gradient(${score > 70 ? 'var(--risk-high)' : score > 40 ? 'var(--risk-medium)' : 'var(--risk-low)'} ${score}%, #e0e0e0 0)` }}>
          <span className="circular-progress-value" style={{ fontSize: '1.25rem' }}>{score}</span>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: score > 70 ? 'var(--risk-high)' : 'var(--risk-low)' }}>
            {score > 70 ? 'High Risk' : score > 40 ? 'Medium Risk' : 'Low Risk'}
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Out of 100</div>
        </div>
      </div>
      
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Risk Factors</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {factors.map((factor, idx) => (
          <div key={idx} className="progress-container">
            <div className="progress-header">
              <span>{factor.name}</span>
              <span className="text-muted">{factor.value}%</span>
            </div>
            <div className="progress-track">
              <div 
                className={`progress-fill ${factor.value > 70 ? 'high' : factor.value > 40 ? 'medium' : 'low'}`} 
                style={{ width: `${factor.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

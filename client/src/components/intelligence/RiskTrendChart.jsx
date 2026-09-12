import React from 'react';
import './RiskTrendChart.css';

const RiskTrendChart = ({ scans }) => {
  if (!scans || scans.length === 0) {
    return (
      <div className="card risk-trend-chart">
        <h3 className="h4 mb-4">Crop Risk Trend</h3>
        <p className="text-muted">Insufficient data for trend analysis.</p>
      </div>
    );
  }

  // Get last 7 scans, sort by date ascending for chart
  const recentScans = [...scans].slice(0, 7).reverse();

  // Find max score to scale the chart
  const maxScore = 100;
  
  let trendMessage = "Stable";
  if (recentScans.length > 1) {
    const latest = recentScans[recentScans.length - 1].riskScore || 0;
    const previous = recentScans[recentScans.length - 2].riskScore || 0;
    if (latest > previous + 10) trendMessage = "Risk is increasing — inspect the field soon.";
    else if (latest < previous - 10) trendMessage = "Decreasing";
  }

  return (
    <div className="card risk-trend-chart">
      <div className="trend-header">
        <h3 className="h4">Crop Risk Trend</h3>
        <span className={`trend-badge ${trendMessage.includes('increasing') ? 'trend-bad' : 'trend-good'}`}>
          {trendMessage}
        </span>
      </div>

      <div className="chart-container">
        {recentScans.map((scan, index) => {
          const score = scan.riskScore || 0;
          const height = `${(score / maxScore) * 100}%`;
          
          let barColor = '#4CAF50';
          if (score >= 30) barColor = '#FFC107';
          if (score >= 60) barColor = '#FF9800';
          if (score >= 80) barColor = '#F44336';

          const dateObj = new Date(scan.createdAt);
          const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

          return (
            <div key={index} className="chart-bar-group">
              <div className="chart-bar-wrapper">
                <div 
                  className="chart-bar-fill" 
                  style={{ height, backgroundColor: barColor }}
                  title={`Score: ${score} - ${scan.diagnosis}`}
                ></div>
                <div className="chart-bar-value">{score}</div>
              </div>
              <div className="chart-label">{dateStr}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskTrendChart;

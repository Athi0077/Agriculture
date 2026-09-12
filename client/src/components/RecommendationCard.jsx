import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export default function RecommendationCard() {
  const recommendations = [
    {
      priority: 1,
      text: "Inspect nearby plants for early symptoms.",
      icon: <AlertCircle size={20} />
    },
    {
      priority: 2,
      text: "Improve field ventilation and avoid excess irrigation.",
      icon: <AlertCircle size={20} />
    },
    {
      priority: 3,
      text: "Consider the recommended fungicide treatment after verifying the diagnosis.",
      icon: <AlertCircle size={20} />
    }
  ];

  return (
    <div className="card">
      <h2 className="h3" style={{ marginBottom: '1.5rem' }}>Recommended Actions</h2>
      
      <div>
        {recommendations.map((rec) => (
          <div key={rec.priority} className="recommendation-item">
            <div className="rec-icon">
              {rec.icon}
            </div>
            <div className="rec-content">
              <div className="rec-header">
                <span className="rec-title">Priority {rec.priority}</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>{rec.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}>
        View All Recommendations <ArrowRight size={16} />
      </button>
    </div>
  );
}

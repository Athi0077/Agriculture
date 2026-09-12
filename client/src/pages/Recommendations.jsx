import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RecommendationList from '../components/intelligence/RecommendationList';
import { getScans } from '../services/api';

export default function Recommendations() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await getScans();
        if (response.success) {
          setScans(response.scans);
        }
      } catch (error) {
        console.error('Error fetching scans:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const latestScan = scans.length > 0 ? scans[0] : null;

  return (
    <div>
      <Navbar title="Recommendations" subtitle="Actionable steps to protect your crops based on AI analysis." />
      <div style={{ maxWidth: '1000px' }}>
        {loading ? (
          <div className="card"><p>Loading recommendations...</p></div>
        ) : !latestScan ? (
          <div className="card">
            <p className="text-muted">No recommendations available. Please run an AI analysis first.</p>
          </div>
        ) : (
          <div>
            <h3 className="h4 mb-4" style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>
              Recommendations for: <span style={{ color: 'var(--primary-color)' }}>{latestScan.diagnosis || 'Analyzed Crop'}</span>
            </h3>
            <RecommendationList recommendations={latestScan.recommendations} />
          </div>
        )}
      </div>
    </div>
  );
}

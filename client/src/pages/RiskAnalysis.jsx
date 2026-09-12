import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import RiskScore from '../components/intelligence/RiskScore';
import RiskFactorBreakdown from '../components/intelligence/RiskFactorBreakdown';
import RiskDrivers from '../components/intelligence/RiskDrivers';
import RiskMap from '../components/intelligence/RiskMap';
import { getScans } from '../services/api';

export default function RiskAnalysis() {
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
      <Navbar title="Risk Analysis" subtitle="Detailed breakdown of current field risks based on the latest AI scan." />
      <div style={{ maxWidth: '1000px' }}>
        {loading ? (
          <div className="card"><p>Loading analysis...</p></div>
        ) : !latestScan ? (
          <div className="card">
            <p className="text-muted">No scans available. Please go to Disease Detection to run an analysis.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <RiskScore score={latestScan.riskScore} level={latestScan.riskLevel} />
              </div>
              <div style={{ flex: 2 }}>
                <RiskFactorBreakdown breakdown={latestScan.factorBreakdown} />
              </div>
            </div>
            
            <RiskDrivers explanation={latestScan.explanation} />
            
            <div className="card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#1f2937' }}>Regional Risk Map</h3>
              <p style={{ color: '#4b5563', marginBottom: '20px', fontSize: '0.95rem' }}>
                Anonymized data from nearby farms to help you track the spread of crop diseases in your region.
              </p>
              <RiskMap />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

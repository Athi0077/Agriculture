import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Eye, Share2 } from 'lucide-react';
import { BASE_URL } from '../services/api';
import RiskScore from './intelligence/RiskScore';
import RiskFactorBreakdown from './intelligence/RiskFactorBreakdown';
import RiskDrivers from './intelligence/RiskDrivers';
import RecommendationList from './intelligence/RecommendationList';
import DoubtChat from './intelligence/DoubtChat';

export default function RecentScans({ scans = [], loading = false, hideViewAll = false, onDelete }) {
  const navigate = useNavigate();
  const [selectedScan, setSelectedScan] = useState(null);

  if (loading) {
    return (
      <div className="card">
        <h2 className="h3 mb-4">Recent Scans</h2>
        <p>Loading scans...</p>
      </div>
    );
  }

  return (
    <div className="card recent-scans-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="h3">Recent Scans</h2>
        {!hideViewAll && (
          <button className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/history')}>View All</button>
        )}
      </div>
      
      <div className="recent-scans-table-wrapper">
        {scans.length === 0 ? (
          <p className="text-muted text-center py-4">No scans found. Start by scanning a crop.</p>
        ) : (
          <table className="recent-scans-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Diagnosis</th>
                <th>AI Conf.</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Weather Risk</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((scan) => {
                const weatherRisk = scan.factorBreakdown?.weather > 15 ? 'High' : (scan.factorBreakdown?.weather > 5 ? 'Moderate' : 'Low');
                return (
                  <tr key={scan._id}>
                    <td style={{ fontWeight: 500 }}>{scan.cropType}</td>
                    <td>{scan.diagnosis}</td>
                    <td>{scan.confidence}%</td>
                    <td>
                      <span style={{ fontWeight: 'bold' }}>{scan.riskScore || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${scan.riskLevel?.toLowerCase() || 'unknown'}`}>
                        {scan.riskLevel || 'Unknown'}
                      </span>
                    </td>
                    <td>{weatherRisk}</td>
                    <td className="text-muted">{new Date(scan.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => setSelectedScan(scan)}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: 'AgriVision AI Scan Result',
                                text: `Crop: ${scan.cropType}\nDiagnosis: ${scan.diagnosis}\nRisk: ${scan.riskLevel}`,
                              }).catch(err => console.error('Share failed', err));
                            } else {
                              alert(`Scan Details:\nCrop: ${scan.cropType}\nDiagnosis: ${scan.diagnosis}`);
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#2196F3', cursor: 'pointer' }}
                          title="Share"
                        >
                          <Share2 size={18} />
                        </button>
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(scan._id)}
                            style={{ background: 'none', border: 'none', color: '#F44336', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Details */}
      {selectedScan && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 9999, display: 'flex', 
          justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '100%', maxWidth: '1000px', 
            maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', padding: '24px', position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
          }}>
            <button 
              onClick={() => setSelectedScan(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', zIndex: 10 }}
            >
              <X size={24} />
            </button>
            <h2 className="h3 mb-4" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingRight: '40px' }}>
              Scan Details - {new Date(selectedScan.createdAt).toLocaleString()}
            </h2>
            
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {selectedScan.imageUrl && (
                <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <img src={`${BASE_URL}/${selectedScan.imageUrl.replace(/\\/g, '/')}`} alt="Crop" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
                  </div>
                </div>
              )}
              
              <div style={{ flex: '2 1 400px', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
                    <RiskScore score={selectedScan.riskScore} level={selectedScan.riskLevel} />
                  </div>
                  <div style={{ flex: '2 1 300px', minWidth: '300px' }}>
                    <RiskFactorBreakdown breakdown={selectedScan.factorBreakdown} />
                  </div>
                </div>
                
                <RiskDrivers explanation={selectedScan.explanation} />
              </div>
            </div>
            
            {selectedScan.recommendations && selectedScan.recommendations.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <RecommendationList recommendations={selectedScan.recommendations} />
              </div>
            )}
            
            {selectedScan.chatHistory && selectedScan.chatHistory.length > 0 && (
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                <DoubtChat 
                  scanId={selectedScan._id}
                  initialHistory={selectedScan.chatHistory}
                  context={{
                    crop: selectedScan.cropType,
                    diagnosis: selectedScan.diagnosis,
                    symptoms: selectedScan.symptoms,
                    recommendations: selectedScan.recommendations
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

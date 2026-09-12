import React, { useState, useEffect } from 'react';
import { getAIReports, markReportAsRead } from '../services/api';
import { useTranslation } from 'react-i18next';
import { 
  Bot, Clock, AlertTriangle, TrendingUp, TrendingDown, 
  CheckCircle, FileText, X, Search, ChevronRight, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AIReports.css';

export default function AIReports() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await getAIReports();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = async (report) => {
    setSelectedReport(report);
    if (!report.isRead) {
      try {
        await markReportAsRead(report._id);
        setReports(prev => prev.map(r => r._id === report._id ? { ...r, isRead: true } : r));
      } catch (error) {
        console.error('Error marking report as read', error);
      }
    }
  };

  const closeReport = () => {
    setSelectedReport(null);
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'var(--risk-low)';
      case 'moderate': return 'var(--risk-medium)';
      case 'high': return 'var(--risk-high)';
      case 'critical': return 'var(--risk-high)';
      default: return 'var(--text-muted)';
    }
  };

  // Group reports by date string (Today, Yesterday, etc.)
  const groupReportsByDate = (reportsList) => {
    const groups = {};
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    reportsList.forEach(report => {
      const reportDate = new Date(report.generatedAt).toLocaleDateString();
      let groupName = reportDate;
      if (reportDate === today) groupName = t('Today');
      else if (reportDate === yesterday) groupName = t('Yesterday');
      else groupName = reportDate; // could also group as "Older"

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(report);
    });

    return groups;
  };

  const groupedReports = groupReportsByDate(reports);

  return (
    <div className="ai-reports-container">
      <div className="ai-reports-header">
        <h1 className="h1" style={{ marginBottom: '0.5rem' }}>{t('AI Farming Reports')}</h1>
        <p className="text-muted">
          {t('Your crop-health reports are automatically generated every 6 hours using your previous scan data.')}
        </p>
      </div>

      <div className="ai-reports-header-card">
        <div className="ai-reports-icon">
          <Bot size={24} />
        </div>
        <div className="ai-reports-info">
          <h2>{t('Automated Reports')} ⏱</h2>
          <p>
            {t('Reports are generated automatically every 6 hours. Each report analyzes your recent crop scan history to identify important crop-health patterns, risks, and recommendations.')}
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spin" style={{ color: 'var(--primary-color)' }}><Bot size={32} /></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="ai-reports-empty">
          <div className="ai-reports-empty-icon">
            <ScanSearch size={32} />
          </div>
          <h3>{t('No AI reports yet')} 🌱</h3>
          <p>{t('Complete a crop scan to start receiving automated AI farming reports every 6 hours.')}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/detection')}
            style={{ marginTop: '1rem' }}
          >
            {t('Go to Disease Detection')}
          </button>
        </div>
      ) : (
        <div className="ai-reports-list-wrapper">
          {Object.entries(groupedReports).map(([groupName, groupReports]) => (
            <div key={groupName}>
              <h3 className="date-group-header">{groupName}</h3>
              <div className="ai-reports-grid">
                {groupReports.map(report => (
                  <div key={report._id} className={`ai-report-card ${!report.isRead ? 'unread' : ''}`}>
                    {!report.isRead && <div className="unread-indicator"></div>}
                    
                    <div className="ai-report-date">
                      {new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    <h3 className="ai-report-title">{report.title}</h3>
                    
                    <div className="ai-report-metrics">
                      <div className="ai-report-metric">
                        <span className="ai-report-metric-label">{t('Health')}</span>
                        <span className="ai-report-metric-value">{report.overallStatus}</span>
                      </div>
                      <div className="ai-report-metric">
                        <span className="ai-report-metric-label">{t('Risk')}</span>
                        <span className="ai-report-metric-value" style={{ color: getRiskColor(report.riskLevel) }}>
                          {report.riskLevel}
                        </span>
                      </div>
                    </div>
                    
                    <p className="ai-report-summary">{report.summary}</p>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        {report.scanCount} {t('scans analyzed')}
                      </div>
                      <button 
                        className={`ai-report-btn ${!report.isRead ? 'unread' : ''}`}
                        onClick={() => handleOpenReport(report)}
                      >
                        {t('View Full Report')} <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Report Modal */}
      {selectedReport && (
        <div className="ai-report-modal-overlay" onClick={closeReport}>
          <div className="ai-report-modal" onClick={e => e.stopPropagation()}>
            <div className="ai-report-modal-header">
              <h2><Bot size={20} /> {selectedReport.title}</h2>
              <button className="ai-report-modal-close" onClick={closeReport}>
                <X size={20} />
              </button>
            </div>
            
            <div className="ai-report-modal-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('Generated on')}</div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(selectedReport.generatedAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('Based on')}</div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedReport.scanCount} {t('previous scans')}
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3><Activity size={18} className="report-section-icon" /> {t('Overall Crop Health')}</h3>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('Status')}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedReport.overallStatus}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('Risk Level')}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: getRiskColor(selectedReport.riskLevel) }}>
                      {selectedReport.riskLevel}
                    </div>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3><FileText size={18} className="report-section-icon" /> {t('Summary')}</h3>
                <p style={{ lineHeight: 1.6, color: 'var(--text-dark)' }}>{selectedReport.summary}</p>
              </div>

              {selectedReport.keyFindings?.length > 0 && (
                <div className="report-section">
                  <h3><Search size={18} className="report-section-icon" /> {t('Key Findings')}</h3>
                  <ul className="report-list">
                    {selectedReport.keyFindings.map((finding, idx) => (
                      <li key={idx}>{finding}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReport.changes?.length > 0 && (
                <div className="report-section">
                  <h3><TrendingUp size={18} className="report-section-icon" /> {t('Changes Since Previous Scans')}</h3>
                  <ul className="report-list">
                    {selectedReport.changes.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedReport.recommendations?.length > 0 && (
                <div className="report-section">
                  <h3><CheckCircle size={18} className="report-section-icon" /> {t('Recommendations')}</h3>
                  <ul className="report-list">
                    {selectedReport.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import CropScanner from '../components/CropScanner';
import RecentScans from '../components/RecentScans';
import CropHealthSummary from '../components/intelligence/CropHealthSummary';
import RiskTrendChart from '../components/intelligence/RiskTrendChart';
import { ScanSearch, CheckCircle2, AlertTriangle, Map, FileText, ChevronRight } from 'lucide-react';
import { getScans, getAIReports } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    diseased: 0,
    highRisk: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getScans();
        if (response.success) {
          setScans(response.scans);
          
          // Calculate stats
          const total = response.scans.length;
          const healthy = response.scans.filter(s => s.diseaseType?.toLowerCase() === 'healthy').length;
          const diseased = response.scans.filter(s => s.diseaseType?.toLowerCase() !== 'healthy' && s.diagnosis?.toLowerCase() !== 'unknown').length;
          const highRisk = response.scans.filter(s => s.riskLevel?.toLowerCase() === 'high' || s.riskLevel?.toLowerCase() === 'critical').length;
          
          setStats({
            total,
            healthy: total > 0 ? Math.round((healthy / total) * 100) + '%' : '0%',
            diseased,
            highRisk
          });
        }
        
        // Fetch AI Reports
        const reportsRes = await getAIReports();
        if (reportsRes.success && reportsRes.reports && reportsRes.reports.length > 0) {
          setLatestReport(reportsRes.reports[0]);
        }
        
      } catch (error) {
        console.error('Failed to fetch scans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const latestScan = scans.length > 0 ? scans[0] : null;

  return (
    <div className="dashboard">
      <Navbar 
        title={`Good Morning, ${currentUser?.name?.split(' ')[0] || 'Farmer'} 👋`} 
        subtitle="Monitor your crops and detect potential threats early with AI Intelligence." 
      />

      <div className="stats-grid">
        <StatCard title="Total Scans" value={stats.total.toString()} icon={<ScanSearch size={24} />} />
        <StatCard title="Healthy Crops" value={stats.healthy} icon={<CheckCircle2 size={24} />} />
        <StatCard title="Disease Detected" value={stats.diseased.toString()} icon={<AlertTriangle size={24} />} />
        <StatCard title="High Risk Fields" value={stats.highRisk.toString()} icon={<Map size={24} />} />
      </div>

      <div className="dashboard-main-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {latestReport && (
            <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(to right bottom, #ffffff, #F8FBF8)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                  <FileText size={18} /> Latest AI Farming Report
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(latestReport.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                {latestReport.summary}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {latestReport.scanCount} scans analyzed
                </span>
                <button 
                  onClick={() => navigate('/ai-reports')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', padding: 0 }}
                >
                  View Report <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          <CropHealthSummary latestScan={latestScan} />
          <RiskTrendChart scans={scans} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CropScanner />
          <RecentScans scans={scans.slice(0, 5)} loading={loading} />
        </div>
      </div>
    </div>
  );
}

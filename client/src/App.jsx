import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import RiskAnalysis from './pages/RiskAnalysis';
import WeatherField from './pages/WeatherField';
import History from './pages/History';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Community from './pages/Community';
import AIReports from './pages/AIReports';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { getPendingScans, clearPendingScan } from './services/offlineSync';
import { analyzeIntelligence } from './services/api';
import AIAssistant from './components/AIAssistant/AIAssistant';

const AppLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      
      // Attempt background sync
      const scans = await getPendingScans();
      if (scans.length > 0) {
        setSyncing(true);
        for (const scan of scans) {
          try {
            const formData = new FormData();
            formData.append('image', scan.data.image);
            formData.append('cropType', scan.data.cropType);
            formData.append('cropStage', scan.data.cropStage);
            formData.append('cropVariety', scan.data.cropVariety);
            formData.append('soilCondition', scan.data.soilCondition);
            if (scan.data.lat && scan.data.lng) {
              formData.append('lat', scan.data.lat);
              formData.append('lng', scan.data.lng);
            }
            
            await analyzeIntelligence(formData);
            await clearPendingScan(scan.id);
          } catch (e) {
            console.error('Background sync failed for scan', scan.id, e);
          }
        }
        setSyncing(false);
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={isAuthPage ? '' : 'app-container'}>
      {isOffline && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#F59E0B', color: 'white', textAlign: 'center', padding: '0.5rem', zIndex: 9999, fontWeight: 500, fontSize: '14px' }}>
          You are currently offline. Scans will be saved locally.
        </div>
      )}
      {syncing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#10B981', color: 'white', textAlign: 'center', padding: '0.5rem', zIndex: 9999, fontWeight: 500, fontSize: '14px' }}>
          Syncing offline scans to the server...
        </div>
      )}
      {!isAuthPage && <Sidebar />}
      <main className={isAuthPage ? '' : 'main-content'} style={{ paddingTop: (isOffline || syncing) ? '40px' : 0 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
          <Route path="/risk" element={<ProtectedRoute><RiskAnalysis /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><WeatherField /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/ai-reports" element={<ProtectedRoute><AIReports /></ProtectedRoute>} />
        </Routes>
      </main>
      
      {/* Global AI Assistant */}
      {!isAuthPage && <AIAssistant />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;

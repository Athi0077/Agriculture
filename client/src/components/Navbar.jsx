import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getNotifications, markNotificationAsRead } from '../services/api';

export default function Navbar({ title, subtitle }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchUserNotifications();
    
    // Poll for notifications every 5 minutes in case a background cron job generates one
    const interval = setInterval(fetchUserNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserNotifications = async () => {
    try {
      const data = await getNotifications();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    setShowNotifications(false);
    
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notification read', err);
      }
    }
    
    if (notif.type === 'AI_REPORT') {
      navigate('/ai-reports');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="dashboard-header">
      <div className="dashboard-title-container">
        <h1 className="h1">{title}</h1>
      </div>
      
      <div className="dashboard-subtitle-container">
        <span className="mobile-role">{t('Farmer')}</span>
        <p className="text-muted dashboard-subtitle">{subtitle}</p>
      </div>

      <div className="dashboard-actions">
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button 
            className="notification-btn" 
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge"></span>}
          </button>

          {showNotifications && (
            <div className="profile-dropdown" style={{ width: '320px', padding: 0 }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>
                {t('Notifications')}
              </div>
              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('No notifications')}
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        backgroundColor: notif.isRead ? 'white' : '#F8FBF8',
                        display: 'flex',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ color: 'var(--primary-color)', marginTop: '2px' }}>
                        {notif.type === 'AI_REPORT' ? <FileText size={18} /> : <Bell size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: notif.isRead ? 500 : 600, color: 'var(--text-dark)', marginBottom: '4px' }}>
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            className="header-profile-avatar" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {userInitial}
          </div>
          
          {showDropdown && (
            <div className="profile-dropdown">
              <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{currentUser?.name || 'User'}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentUser?.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="profile-dropdown-logout"
              >
                <LogOut size={16} />
                <span style={{ fontWeight: 500 }}>{t('Logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

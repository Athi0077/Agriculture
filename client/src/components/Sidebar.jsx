import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ScanSearch, AlertTriangle, CloudSun, History, Lightbulb, Settings, Sprout, LogOut, Users, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close more menu on route change
  useEffect(() => {
    setShowMore(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: t('Dashboard'), path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('Disease Detection'), path: '/detection', icon: <ScanSearch size={20} /> },
    { name: t('Risk Analysis'), path: '/risk', icon: <AlertTriangle size={20} /> },
    { name: t('Weather & Field'), path: '/weather', icon: <CloudSun size={20} /> },
    { name: t('Recommendations'), path: '/recommendations', icon: <Lightbulb size={20} /> },
    { name: t('Community'), path: '/community', icon: <Users size={20} /> },
    { name: t('History'), path: '/history', icon: <History size={20} /> },
    { name: t('Settings'), path: '/settings', icon: <Settings size={20} /> },
  ];

  const primaryMobileItems = navItems.slice(0, 4);
  const moreMobileItems = navItems.slice(4);

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Sprout size={28} />
          <span>AgriVision AI</span>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
          <button 
            onClick={handleLogout}
            className="nav-item" 
            style={{ 
              background: 'none', 
              border: 'none', 
              width: '100%', 
              textAlign: 'left', 
              cursor: 'pointer', 
              color: 'inherit',
              font: 'inherit',
              marginTop: 'auto'
            }}
          >
            <LogOut size={20} />
            <span>{t('Logout')}</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <div className="profile-section">
            <div className="profile-avatar">{currentUser?.name?.charAt(0) || 'U'}</div>
            <div className="profile-info">
              <span className="profile-name">{currentUser?.name || 'User'}</span>
              <span className="profile-role">Farmer</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        {/* More Menu Popover */}
        <div className={`mobile-more-menu ${showMore ? 'open' : ''}`} ref={moreMenuRef}>
          <div className="mobile-more-menu-inner">
            {moreMobileItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `mobile-more-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
            <button 
              onClick={handleLogout}
              className="mobile-more-item"
            >
              <LogOut size={20} />
              <span>{t('Logout')}</span>
            </button>
          </div>
        </div>

        <div className="mobile-nav-inner">
          {primaryMobileItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="mobile-nav-icon">{item.icon}</div>
              <span className="mobile-nav-label">{item.name.split(' ')[0]}</span>
            </NavLink>
          ))}
          
          <button 
            className={`mobile-nav-item ${showMore ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMore(!showMore);
            }}
          >
            <div className="mobile-nav-icon"><MoreHorizontal size={20} /></div>
            <span className="mobile-nav-label">{t('More')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

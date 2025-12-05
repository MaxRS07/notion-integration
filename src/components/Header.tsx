import React from 'react';

interface HeaderProps {
  onNavigate: (view: 'home' | 'settings') => void;
  currentView: 'home' | 'settings';
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="app-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.8"/>
              <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.6"/>
              <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" opacity="0.4"/>
            </svg>
          </div>
          <h1 className="app-title">Canvas → Notion</h1>
        </div>
        
        <div className="header-tabs">
          <button
            className={`tab-button ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Dashboard
          </button>
          <button
            className={`tab-button ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => onNavigate('settings')}
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

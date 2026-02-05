import React from 'react';
import settingsIcon from '../assets/icons/settings.svg';

type CurrentPage = 'home' | 'app-settings';

interface SidebarProps {
  currentPage: CurrentPage;
  onSelectPage: (page: CurrentPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor" opacity="0.8" />
              <rect x="18" y="4" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="4" y="18" width="10" height="10" rx="2" fill="currentColor" opacity="0.6" />
              <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" opacity="0.4" />
            </svg>
          </div>
          <div className="logo-text">
            <div className="logo-title">Notion Hub</div>
            <div className="logo-subtitle">Integrations</div>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-label">Main</div>
        <div className="integration-list">
          <button
            className={`integration-item ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onSelectPage('home')}
          >
            <div className="integration-info">
              <div className="integration-name">Home</div>
              <div className="integration-description">View all applications</div>
            </div>
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          className={`settings-button ${currentPage === 'app-settings' ? 'active' : ''}`}
          onClick={() => onSelectPage('app-settings')}
        >
          <div className="settings-icon">
            <img src={settingsIcon} alt="Settings" className="settings-icon-img" />
          </div>
          <span>App Settings</span>
        </button>
      </div>
    </div>
  );
};

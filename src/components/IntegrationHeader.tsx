import React from 'react';
import settingsIcon from '../assets/icons/settings.svg';
import actionIcon from '../assets/icons/action.svg';

interface IntegrationHeaderProps {
  title: string;
  img: string;
  description: string;
  onNavigate: (view: 'dashboard' | 'settings' | 'actions') => void;
  currentView: 'dashboard' | 'settings' | 'actions';
}

export const IntegrationHeader: React.FC<IntegrationHeaderProps> = ({
  title,
  img,
  description,
  onNavigate,
  currentView,
}) => {
  return (
    <div className="integration-header">
      <div className="header-top">
        <div className="header-info">
          <img className='header-icon' src={img}></img>
          <div className="header-text">
            <h1 className="header-title">{title}</h1>
            <p className="header-description">{description}</p>
          </div>
        </div>
      </div>

      <div className="header-tabs">
        <button
          className={`tab-button ${currentView === 'actions' ? 'active' : ''}`}
          onClick={() => onNavigate('actions')}
        >
          <img src={actionIcon} alt="Actions" className="tab-icon" />
          Actions
        </button>
        <button
          className={`tab-button ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onNavigate('dashboard')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Dashboard
        </button>
        <button
          className={`tab-button ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => onNavigate('settings')}
        >
          <img src={settingsIcon} alt="Settings" className="tab-icon" />
          Settings
        </button>
      </div>
    </div>
  );
};

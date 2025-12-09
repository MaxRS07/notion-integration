import React from 'react';
import { IntegrationType } from '../types';
import settingsIcon from '../assets/icons/settings.svg';
import canvas from "../assets/icons/canvas.svg"

interface SidebarProps {
  currentIntegration: IntegrationType | 'app-settings';
  onSelectIntegration: (integration: IntegrationType | 'app-settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentIntegration, onSelectIntegration }) => {
  const integrations = [
    {
      id: 'canvas' as IntegrationType,
      name: 'Canvas LMS',
      icon: canvas,
      description: 'Sync courses and assignments',
    },
  ];

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
        <div className="section-label">Integrations</div>
        <div className="integration-list">
          {integrations.map((integration) => (
            <button
              key={integration.id}
              className={`integration-item ${currentIntegration === integration.id ? 'active' : ''}`}
              onClick={() => onSelectIntegration(integration.id)}
            >
              <img src={integration.icon} className="integration-icon"></img>
              <div className="integration-info">
                <div className="integration-name">{integration.name}</div>
                <div className="integration-description">{integration.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button
          className={`settings-button ${currentIntegration === 'app-settings' ? 'active' : ''}`}
          onClick={() => onSelectIntegration('app-settings')}
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

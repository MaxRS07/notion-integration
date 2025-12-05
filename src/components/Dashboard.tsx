import React from 'react';
import { Settings } from '../types';

interface DashboardProps {
  settings: Settings;
}

export const Dashboard: React.FC<DashboardProps> = ({ settings }) => {
  const hasTokens = settings.canvasToken && settings.notionToken;

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {!hasTokens ? (
          <div className="welcome-state">
            <div className="welcome-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                <path d="M32 20V32L40 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="welcome-title">Welcome to Canvas → Notion Bridge</h2>
            <p className="welcome-description">
              Get started by configuring your API tokens in Settings.
              Once set up, your Canvas assignments and courses will automatically sync to Notion.
            </p>
            <div className="welcome-features">
              <div className="feature-item">
                <span className="feature-icon">🔄</span>
                <span className="feature-text">Automatic synchronization</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span className="feature-text">Course & assignment tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Real-time updates</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="connected-state">
            <div className="info-cards">
              <div className="info-card">
                <div className="card-header">
                  <span className="card-icon">📘</span>
                  <h3 className="card-title">Canvas</h3>
                </div>
                <div className="card-status connected">
                  <span className="status-dot"></span>
                  <span>Connected</span>
                </div>
              </div>

              <div className="info-card">
                <div className="card-header">
                  <span className="card-icon">📝</span>
                  <h3 className="card-title">Notion</h3>
                </div>
                <div className="card-status connected">
                  <span className="status-dot"></span>
                  <span>Connected</span>
                </div>
              </div>
            </div>

            <div className="sync-info">
              <h3 className="sync-info-title">Sync Configuration</h3>
              <div className="sync-details">
                <div className="sync-detail-item">
                  <span className="detail-label">Auto Sync:</span>
                  <span className="detail-value">{settings.autoSync ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="sync-detail-item">
                  <span className="detail-label">Interval:</span>
                  <span className="detail-value">Every {settings.syncInterval} minutes</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

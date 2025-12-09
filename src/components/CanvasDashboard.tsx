import React, { useEffect, useState } from 'react';
import { Settings, SyncStatus } from '../types';
import { StatusCard } from './StatusCard';
import { checkCanvasStatus } from '../utils/canvas';
import load from '../assets/icons/loading.svg'

interface CanvasDashboardProps {
  settings: Settings;
  syncStatus: SyncStatus;
  onSync: () => void;
}

export const CanvasDashboard: React.FC<CanvasDashboardProps> = ({
  settings,
  syncStatus,
  onSync,
}) => {
  const hasTokens = settings.canvasToken && settings.notionToken;

  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    setConnected(null);
    handleStatus();
  }, [])
  const handleStatus = async () => {
    setConnected(
      await checkCanvasStatus(settings.canvasToken)
    );
  }

  return (
    <div className="integration-dashboard">
      {hasTokens ? (
        <>
          <StatusCard status={syncStatus} onSync={onSync} />

          <div className="sync-info-card">
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
              <div className="sync-detail-item">
                <span className="detail-label">Canvas:</span>
                {connected === null ?
                  <span className="detail-value status-loading">
                    <img src={load} className='settings-icon-load'></img>
                    Validating Token
                  </span> : connected ?
                    <span className="detail-value status-connected">
                      <span className="status-dot"></span>
                      Connected
                    </span> :
                    <span className="detail-value status-error">
                      <span className="status-dot"></span>
                      Not Connected
                    </span>
                }
              </div>
            </div>
          </div>

          <div className="activity-section">
            <h3 className="section-title">Data Log</h3>
            <div className="activity-list">
            </div>
          </div>
        </>
      ) : (
        <div className="welcome-state">
          <div className="welcome-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2" />
              <path d="M32 20V32L40 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="welcome-title">Connect Canvas to Notion</h2>
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
      )}
    </div>
  );
};

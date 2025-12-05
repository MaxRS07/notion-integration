import React from 'react';
import { SyncStatus } from '../types';

interface StatusCardProps {
  status: SyncStatus;
  onSync: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status, onSync }) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'success':
        return 'status-success';
      case 'error':
        return 'status-error';
      case 'syncing':
        return 'status-syncing';
      default:
        return 'status-idle';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠';
      case 'syncing':
        return '↻';
      default:
        return '○';
    }
  };

  const formatLastSync = () => {
    if (!status.lastSync) return 'Never';
    const now = new Date();
    const diff = now.getTime() - status.lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="status-card">
      <div className="status-header">
        <div className="status-info">
          <div className={`status-indicator ${getStatusColor()}`}>
            <span className="status-icon">{getStatusIcon()}</span>
            <span className="status-text">
              {status.status === 'syncing' ? 'Syncing...' : 
               status.status === 'success' ? 'Up to date' :
               status.status === 'error' ? 'Error' : 'Idle'}
            </span>
          </div>
          <div className="status-details">
            <span className="last-sync">Last sync: {formatLastSync()}</span>
            {status.message && (
              <span className="status-message">{status.message}</span>
            )}
          </div>
        </div>
        <button
          className="sync-button"
          onClick={onSync}
          disabled={status.status === 'syncing'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C9.84 2 11.48 2.82 12.59 4.12M12.59 4.12V1.5M12.59 4.12H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Sync Now
        </button>
      </div>
    </div>
  );
};

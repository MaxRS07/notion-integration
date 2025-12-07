import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { IntegrationHeader } from './components/IntegrationHeader';
import { CanvasDashboard } from './components/CanvasDashboard';
import { CanvasSettings } from './components/CanvasSettings';
import { CanvasActions } from './components/CanvasActions';
import { AppSettings } from './components/AppSettings';
import { Settings, SyncStatus, IntegrationType } from './types';
import { storage } from './utils/storage';
import { useSystemTheme } from './utils/useSystemTheme';
import './App.css';

function App() {
  const theme = useSystemTheme();
  const [currentIntegration, setCurrentIntegration] = useState<IntegrationType | 'app-settings'>('canvas');
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'actions'>('dashboard');
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    status: 'idle',
  });

  useEffect(() => {
    // Load settings
    const stored = storage.getSettings();
    setSettings(stored);
  }, []);

  useEffect(() => {
    // Auto-sync functionality
    if (settings.autoSync && settings.canvasToken && settings.notionToken) {
      const interval = setInterval(() => {
        handleSync();
      }, settings.syncInterval * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [settings.autoSync, settings.syncInterval, settings.canvasToken, settings.notionToken]);

  const handleSync = async () => {
    setSyncStatus({ ...syncStatus, status: 'syncing', message: 'Synchronizing data...' });
    
    try {
      // Simulate sync operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus({
        lastSync: new Date(),
        status: 'success',
        message: 'Sync completed successfully',
      });
    } catch (error) {
      setSyncStatus({
        ...syncStatus,
        status: 'error',
        message: 'Failed to sync data',
      });
    }
  };

  const handleAction = async (actionId: string) => {
    // Simulate action execution
    console.log('Executing action:', actionId);
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleSettingsUpdate = () => {
    const updated = storage.getSettings();
    setSettings(updated);
  };

  const getIntegrationInfo = () => {
    switch (currentIntegration) {
      case 'canvas':
        return {
          title: 'Canvas LMS',
          icon: '📚',
          description: 'Sync courses and assignments to Notion',
        };
      default:
        return {
          title: 'Integration',
          icon: '🔗',
          description: 'Connect your tools to Notion',
        };
    }
  };

  const integrationInfo = getIntegrationInfo();

  // Render App Settings (no tabs, just settings page)
  if (currentIntegration === 'app-settings') {
    return (
      <div className="app">
        <Sidebar 
          currentIntegration={currentIntegration}
          onSelectIntegration={(integration) => {
            setCurrentIntegration(integration);
            setCurrentView('dashboard'); // Reset to dashboard when switching
          }}
        />
        
        <main className="main-content">
          <div className="content-area full-width">
            <AppSettings 
              settings={settings}
              onSettingsSaved={handleSettingsUpdate}
            />
          </div>
        </main>
      </div>
    );
  }

  // Render Integration pages (with tabs)
  return (
    <div className="app">
      <Sidebar 
        currentIntegration={currentIntegration}
        onSelectIntegration={(integration) => {
          setCurrentIntegration(integration);
          setCurrentView('dashboard'); // Reset to dashboard when switching
        }}
      />
      
      <main className="main-content">
        <IntegrationHeader
          title={integrationInfo.title}
          icon={integrationInfo.icon}
          description={integrationInfo.description}
          onNavigate={setCurrentView}
          currentView={currentView}
        />
        
        <div className="content-area">
          {currentIntegration === 'canvas' && (
            <>
              {currentView === 'dashboard' && (
                <CanvasDashboard 
                  settings={settings}
                  syncStatus={syncStatus}
                  onSync={handleSync}
                />
              )}
              {currentView === 'settings' && (
                <CanvasSettings 
                  settings={settings}
                  onSettingsSaved={handleSettingsUpdate}
                />
              )}
              {currentView === 'actions' && (
                <CanvasActions 
                  settings={settings}
                  onAction={handleAction}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { SettingsPage } from './components/SettingsPage';
import { StatusCard } from './components/StatusCard';
import { Settings, SyncStatus } from './types';
import { storage } from './utils/storage';
import { useSystemTheme } from './utils/useSystemTheme';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'settings'>('home');
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: null,
    status: 'idle',
  });

  const theme = useSystemTheme();

  useEffect(() => {
    const stored = storage.getSettings();
    setSettings(stored);

    if (!stored.canvasToken || !stored.notionToken) {
      setCurrentView('settings');
    }
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

  const handleSettingsSaved = () => {
    const updated = storage.getSettings();
    setSettings(updated);
  };

  return (
    <div className="app">
      <Header onNavigate={setCurrentView} currentView={currentView} />

      <main className="main-content">
        {currentView === 'home' && settings.canvasToken && settings.notionToken && (
          <StatusCard status={syncStatus} onSync={handleSync} />
        )}

        {currentView === 'home' ? (
          <Dashboard settings={settings} />
        ) : (
          <SettingsPage onSettingsSaved={handleSettingsSaved} />
        )}
      </main>
    </div>
  );
}

export default App;

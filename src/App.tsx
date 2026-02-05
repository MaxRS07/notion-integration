import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './components/HomePage';
import { AppSettings } from './components/AppSettings';
import { Settings } from './types';
import { storage } from './utils/storage';
import { useSystemTheme } from './utils/useSystemTheme';

import './App.css';

type CurrentPage = 'home' | 'app-settings';

function App() {
  const theme = useSystemTheme();
  const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());

  useEffect(() => {
    // Load settings
    const stored = storage.getSettings();
    setSettings(stored);
  }, []);

  const handleSettingsUpdate = () => {
    const updated = storage.getSettings();
    setSettings(updated);
  };

  return (
    <div className="app">
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
      />

      <main className="main-content">
        <div className="content-area">
          {currentPage === 'home' && (
            <HomePage settings={settings} />
          )}
          {currentPage === 'app-settings' && (
            <AppSettings
              settings={settings}
              onSettingsSaved={handleSettingsUpdate}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

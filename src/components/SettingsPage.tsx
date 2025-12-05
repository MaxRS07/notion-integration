import React, { useState, useEffect } from 'react';
import { Settings } from '../types';
import { storage } from '../utils/storage';

interface SettingsPageProps {
  onSettingsSaved: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [showCanvasToken, setShowCanvasToken] = useState(false);
  const [showNotionToken, setShowNotionToken] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    storage.saveSettings(settings);
    setSaved(true);
    onSettingsSaved();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings?')) {
      const defaultSettings: Settings = {
        canvasToken: '',
        notionToken: '',
        syncInterval: 15,
        autoSync: false,
        themeMode: 'system',
      };
      setSettings(defaultSettings);
      storage.saveSettings(defaultSettings);
      onSettingsSaved();
    }
  };

  const isValid = settings.canvasToken.trim() !== '' && settings.notionToken.trim() !== '';

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-section">
          <h2 className="section-title">API Configuration</h2>
          <p className="section-description">
            Connect your Canvas and Notion accounts to enable synchronization.
          </p>

          <div className="form-group">
            <label className="form-label">
              Canvas Access Token
              <span className="label-required">*</span>
            </label>
            <div className="input-with-toggle">
              <input
                type={showCanvasToken ? 'text' : 'password'}
                className="form-input"
                value={settings.canvasToken}
                onChange={(e) => setSettings({ ...settings, canvasToken: e.target.value })}
                placeholder="Enter your Canvas API token"
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowCanvasToken(!showCanvasToken)}
                type="button"
              >
                {showCanvasToken ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="form-help">
              Get your token from Canvas → Account → Settings → New Access Token
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Notion Integration Token
              <span className="label-required">*</span>
            </label>
            <div className="input-with-toggle">
              <input
                type={showNotionToken ? 'text' : 'password'}
                className="form-input"
                value={settings.notionToken}
                onChange={(e) => setSettings({ ...settings, notionToken: e.target.value })}
                placeholder="Enter your Notion integration token"
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowNotionToken(!showNotionToken)}
                type="button"
              >
                {showNotionToken ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="form-help">
              Create an integration at notion.so/my-integrations
            </p>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <h2 className="section-title">Sync Preferences</h2>
          <p className="section-description">
            Customize how and when your data syncs between Canvas and Notion.
          </p>

          <div className="form-group">
            <label className="form-label">Sync Interval (minutes)</label>
            <div className="slider-container">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={settings.syncInterval}
                onChange={(e) => setSettings({ ...settings, syncInterval: parseInt(e.target.value) })}
                className="form-slider"
              />
              <span className="slider-value">{settings.syncInterval} min</span>
            </div>
          </div>

          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                className="form-checkbox"
              />
              <span>Enable automatic synchronization</span>
            </label>
            <p className="form-help">
              When enabled, data will sync automatically in the background
            </p>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <h2 className="section-title">Visual Settings</h2>
          <p className="section-description">
            Customize the appearance of the application.
          </p>

          <div className="form-group">
            <label className="form-label">Theme Mode</label>
            <div className="theme-selector">
              <button
                className={`theme-option ${settings.themeMode === 'light' ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, themeMode: 'light' })}
                type="button"
              >
                <div className="theme-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="4" fill="currentColor"/>
                    <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.657 15.657L14.243 14.243M5.757 5.757L4.343 4.343M15.657 4.343L14.243 5.757M5.757 14.243L4.343 15.657" 
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="theme-info">
                  <div className="theme-name">Light</div>
                  <div className="theme-desc">Bright theme</div>
                </div>
              </button>

              <button
                className={`theme-option ${settings.themeMode === 'dark' ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, themeMode: 'dark' })}
                type="button"
              >
                <div className="theme-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" 
                          fill="currentColor"/>
                  </svg>
                </div>
                <div className="theme-info">
                  <div className="theme-name">Dark</div>
                  <div className="theme-desc">Dark theme</div>
                </div>
              </button>

              <button
                className={`theme-option ${settings.themeMode === 'system' ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, themeMode: 'system' })}
                type="button"
              >
                <div className="theme-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="3" y="3" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6 17H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M10 14V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="theme-info">
                  <div className="theme-name">System</div>
                  <div className="theme-desc">Match OS</div>
                </div>
              </button>
            </div>
            <p className="form-help">
              System will automatically match your operating system's theme preference
            </p>
          </div>
        </div>

        <div className="settings-actions">
          <button className="button button-secondary" onClick={handleReset}>
            Reset to Defaults
          </button>
          <div className="actions-right">
            {saved && <span className="save-indicator">✓ Saved</span>}
            <button
              className="button button-primary"
              onClick={handleSave}
              disabled={!isValid}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

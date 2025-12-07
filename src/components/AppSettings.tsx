import React, { useEffect, useState } from 'react';
import { Settings } from '../types';
import { storage } from '../utils/storage';
import load from '../assets/icons/loading.svg'
import Root from "../models/notion/user"
import { getNotionUserInfo } from '../utils/notion';

interface AppSettingsProps {
  settings: Settings;
  onSettingsSaved: () => void;
}

export const AppSettings: React.FC<AppSettingsProps> = ({ settings: initialSettings, onSettingsSaved }) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [showNotionToken, setShowNotionToken] = useState(false);
  const [connected, setConnected] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<Root | null>(null)

  useEffect(() => {
    setConnected(null);
    handleSave()
    handleConnection()
  }, [settings])

  const handleSave = () => {
    storage.saveSettings(settings);
    onSettingsSaved();
  };
  const handleConnection = async () => {
    const info = await getNotionUserInfo(settings.notionToken);
    if (info) {
      setConnected("");
      setUserInfo(info);
    } else {
      setConnected("Could not connect, please check your token or internet connection");
      setUserInfo(null);
    }
  }

  const isValid = settings.notionToken.trim() !== '';

  return (
    <div className="app-settings">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-main-title">App Settings</h1>
          <p className="settings-main-description">
            Configure your Notion integration and general app preferences.
          </p>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Notion Integration</h2>
          <p className="section-description">
            Connect your Notion workspace to enable synchronization from all integrations.
          </p>

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
              Create an integration at <a href="https://notion.so/my-integrations" target="_blank" rel="noopener noreferrer">notion.so/my-integrations</a>
            </p>
            <LoadingStatusIndicator connected={connected} />
            {userInfo?.results && userInfo.results.length > 0 &&
              <p>
                {userInfo?.results[0].name}
              </p>
            }
          </div>

          <div className="info-box">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <div className="info-title">One Notion token for all integrations</div>
              <div className="info-text">
                This Notion token will be used by all integrations (Canvas, Google Calendar, etc.)
                to sync data to your Notion workspace.
              </div>
            </div>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <h2 className="section-title">Appearance</h2>
          <p className="section-description">
            Customize how the app looks and feels.
          </p>

          <div className="form-group">
            <label className="form-label">Theme Mode</label>
            <div className="theme-selector">
              <button
                className={`theme-option ${settings.themeMode === 'light' ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, themeMode: 'light' })}
              >
                <span className="theme-icon">☀️</span>
                <span>Light</span>
              </button>
              <button
                className={`theme-option ${settings.themeMode === 'dark' ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, themeMode: 'dark' })}
              >
                <span className="theme-icon">🌙</span>
                <span>Dark</span>
              </button>
              <button
                className={`theme-option ${settings.themeMode === 'system' ? 'active' : ''}`}
                onClick={() => setSettings({ ...settings, themeMode: 'system' })}
              >
                <span className="theme-icon">💻</span>
                <span>System</span>
              </button>
            </div>
            <p className="form-help">
              Choose how the app theme is determined
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LoadingStatusIndicator = (props: { connected: string | null }) => {
  return (
    <>
      {
        props.connected === null ?
          <span className="detail-value status-loading">
            <img src={load} className='settings-icon-load'></img>
            Validating Token
          </span> : (props.connected.length === 0 ? (
            <>
              <span className="detail-value status-connected">
                <span className="status-dot"></span>
                Connected
              </span>
            </>
          ) : (
            <span className="detail-value status-error">
              <span className="status-dot"></span>
              {props.connected}
            </span>
          ))
      }
    </>
  );
}
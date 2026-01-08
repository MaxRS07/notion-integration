import React, { useEffect, useState } from 'react';
import { Settings } from '../types';
import { storage } from '../utils/storage';
import { checkCanvasStatus } from '../utils/canvas';
import { LoadingStatusIndicator } from './AppSettings';

interface CanvasSettingsProps {
  settings: Settings;
  onSettingsSaved: () => void;
}

export const CanvasSettings: React.FC<CanvasSettingsProps> = ({ settings: initialSettings, onSettingsSaved }) => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [showCanvasToken, setShowCanvasToken] = useState(false);
  const [saved, setSaved] = useState(false);

  const [connected, setConnected] = useState<string | null>(null);

  useEffect(() => {
    handleStatus();
    handleSave();
  }, [settings])

  const handleStatus = async () => {
    setConnected(null);
    if (await checkCanvasStatus(settings.canvasToken)) {
      setConnected("")
    } else
      setConnected("Could not connect, please check your token or internet connection")         // error message from Rust
  }
  const handleSave = () => {
    storage.saveSettings(settings);
    setSaved(true);
    onSettingsSaved();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="integration-settings">
      <div className="settings-container">
        <div className="settings-section">
          <h2 className="section-title">Canvas API Configuration</h2>
          <p className="section-description">
            Connect your Canvas LMS account to enable synchronization with Notion.
          </p>

          <div className="form-group">
            <label className="form-label">
              School Name
              <span className="label-required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={settings.canvasSchoolName}
              onChange={(e) => setSettings({ ...settings, canvasSchoolName: e.target.value })}
              placeholder="northeastern"
            />
            <p className="form-help">
              Enter your school as it appears in your canvas domain <br></br>e.g. northeastern in https://northeastern.instructure.com/
            </p>
          </div>

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
            <LoadingStatusIndicator connected={connected} />
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
        </div>
      </div>
    </div >
  );
};
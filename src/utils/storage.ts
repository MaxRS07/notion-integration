import { Settings } from '../types';

const SETTINGS_KEY = 'canvas-notion-settings';

export const storage = {
  getSettings: (): Settings => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      canvasToken: '',
      notionToken: '',
      syncInterval: 15,
      autoSync: false,
      themeMode: 'system',
    };
  },

  saveSettings: (settings: Settings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  clearSettings: (): void => {
    localStorage.removeItem(SETTINGS_KEY);
  },
};

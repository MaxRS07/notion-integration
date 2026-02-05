export interface Settings {
  notionToken: string;
  syncInterval: number;
  autoSync: boolean;
  themeMode: 'system' | 'light' | 'dark' | 'midnight';
  // Canvas-specific (can be extended for other apps)
  canvasToken?: string;
  canvasSchoolName?: string;
}

export interface SyncStatus {
  lastSync: Date | null;
  status: 'idle' | 'syncing' | 'error' | 'success';
  message?: string;
}

export type IntegrationType = 'canvas' | 'google-calendar' | 'slack' | 'github';

export interface Integration {
  id: IntegrationType;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  color: string;
}

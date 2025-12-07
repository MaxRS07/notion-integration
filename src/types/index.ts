export interface Settings {
  canvasToken: string;
  notionToken: string;
  syncInterval: number;
  autoSync: boolean;
  themeMode: 'system' | 'light' | 'dark';
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

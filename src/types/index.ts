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

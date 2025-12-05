import { useEffect, useState } from 'react';

export const useSystemTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check if running in Tauri
    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

    if (isTauri) {
      // For Tauri v1, we need to use the invoke API or listen to system events
      // Since theme detection requires additional setup in Tauri v1, 
      // we'll use the web fallback for now but keep the structure ready
      
      // Future Tauri implementation would go here:
      // import('@tauri-apps/api/window').then(({ appWindow }) => {
      //   // Get and listen for theme changes
      // });
      
      // For now, fall through to web API
    }
    
    // Web API fallback (works in both web and Tauri)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    // Set initial theme
    handleChange(mediaQuery);

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => handleChange(e);
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return theme;
};

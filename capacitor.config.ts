import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.bf8759d722ab453aa5c69df7b1765bb7',
  appName: 'SnapShotz Soles',
  webDir: 'dist',
  server: {
    url: 'https://bf8759d7-22ab-453a-a5c6-9df7b1765bb7.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1A1818',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;

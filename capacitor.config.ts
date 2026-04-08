import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.liorangroup.meetfound',
  appName: 'MeetFound',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;

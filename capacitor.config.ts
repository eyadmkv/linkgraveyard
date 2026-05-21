import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sandooq.links',
  appName: 'Sandooq',
  webDir: 'out', // Let Capacitor load the local exported build first
  server: {
    cleartext: true,
    allowNavigation: ['linkgraveyard.vercel.app']
  }
};

export default config;
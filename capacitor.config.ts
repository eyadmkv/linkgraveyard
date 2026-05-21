import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sandooq.links',
  appName: 'Sandooq',
  webDir: 'out', 
  server: {
    // REMOVE THE "url" PROPERTY COMPLETELY
    cleartext: true,
    allowNavigation: ['linkgraveyard.vercel.app']
  }
};
export default config;
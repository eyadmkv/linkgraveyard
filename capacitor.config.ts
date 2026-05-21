import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sandooq.links',
  appName: 'Sandooq',
  webDir: 'out', // Points to your static Next.js export builds
  server: {
    // Put your deployed production Vercel URL here so sharing works from APK
    url: 'https://linkgraveyard.vercel.app', 
    cleartext: true
  }
};

export default config;
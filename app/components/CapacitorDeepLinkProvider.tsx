'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { App } from '@capacitor/app';

export default function CapacitorDeepLinkProvider() {
  const router = useRouter();

  useEffect(() => {
    const setupDeepLinks = async () => {
      // Listen for when an Android Intent sends a URL to our app
      await App.addListener('appUrlOpen', (data) => {
        try {
          // data.url looks like: https://linkgraveyard.vercel.app/profile
          const url = new URL(data.url);
          const path = url.pathname + url.search; // Extracts "/profile"

          // Force Next.js to navigate cleanly inside the Webview sandbox
          router.push(path);
        } catch (error) {
          console.error("Failed to parse deep link URL:", error);
        }
      });
    };

    setupDeepLinks();

    // Clean up native listeners on unmount
    return () => {
      App.removeAllListeners();
    };
  }, [router]);

  return null; // This component doesn't render anything visually
}
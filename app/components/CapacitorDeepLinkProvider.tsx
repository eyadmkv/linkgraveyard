'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CapacitorDeepLinkProvider() {
  const router = useRouter();

  useEffect(() => {
    // Only import the capacitor app module on the client side
    import('@capacitor/app').then(({ App }) => {
      App.addListener('appUrlOpen', (data) => {
        const url = new URL(data.url);
        const path = url.pathname + url.search;
        router.push(path);
      });
    });
  }, [router]);

  return null;
}
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('[LOG] Service Worker registered successfully');
        })
        .catch((error) => {
          console.error('[Error] Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}

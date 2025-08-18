import React from 'react'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Service Worker kaydı - PWA desteği için (sadece production'da)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    .then((registration) => {
      // Sessiz kayıt - sadece geliştirme modunda log
      if (import.meta.env.DEV) {
        console.log('Service Worker kaydedildi');
      }
      
      // Güncelleme kontrolü
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Yeni service worker hazır - sessiz güncelleme
              if (import.meta.env.DEV) {
                console.log('Yeni içerik mevcut, sayfa yenilenebilir.');
              }
            }
          });
        }
      });
    })
    .catch((registrationError) => {
      // Sadece gerçek hatalar için uyarı
      if (import.meta.env.DEV) {
        console.warn('Service Worker kaydı başarısız:', registrationError);
      }
    });
  });
}
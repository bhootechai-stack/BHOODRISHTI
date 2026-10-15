import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerServiceWorker } from './services/serviceWorkerRegistration';
import './index.css';


// Register PWA service worker with Cache API strategies
registerServiceWorker({
  onSuccess: () => {
    console.log('[BhooTech AI] Service worker active. Agricultural Cache API ready.');
  },
});

// Global error handlers to capture and isolate cross-origin script/network telemetry noise
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('Script error')) {
      // Cross-origin script error notification suppressed from bubbling uncaught
      console.warn('Cross-origin script event intercepted safely:', event);
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Handled async promise rejection:', event.reason);
    // Prevent unhandled rejection from terminating runtime
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


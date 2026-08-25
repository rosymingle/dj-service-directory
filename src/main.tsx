import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BookingOverlayProvider } from './context/BookingOverlayContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BookingOverlayProvider>
      <App />
    </BookingOverlayProvider>
  </StrictMode>,
);
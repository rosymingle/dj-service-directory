import { createContext, useContext, useState, type ReactNode } from 'react';

interface BookingOverlayContextValue {
  activeUrl: string | null;
  openBooking: (url: string) => void;
  closeBooking: () => void;
}

const BookingOverlayContext = createContext<BookingOverlayContextValue | null>(null);

export function BookingOverlayProvider({ children }: { children: ReactNode }) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  return (
    <BookingOverlayContext.Provider
      value={{
        activeUrl,
        openBooking: (url) => setActiveUrl(url),
        closeBooking: () => setActiveUrl(null),
      }}
    >
      {children}
    </BookingOverlayContext.Provider>
  );
}

export function useBookingOverlay() {
  const ctx = useContext(BookingOverlayContext);
  if (!ctx) {
    throw new Error('useBookingOverlay must be used within a BookingOverlayProvider');
  }
  return ctx;
}
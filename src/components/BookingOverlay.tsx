import { useEffect } from 'react';
import { useBookingOverlay } from '../context/BookingOverlayContext';
import styles from './BookingOverlay.module.css';

export function BookingOverlay() {
  const { activeUrl, closeBooking } = useBookingOverlay();
  const isOpen = activeUrl !== null;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeBooking();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeBooking]);

  return (
    <>
      <div
        className={isOpen ? styles.backdropOpen : styles.backdrop}
        onClick={closeBooking}
        aria-hidden={!isOpen}
      />

      <button
        type="button"
        className={`${isOpen ? styles.closeButtonOpen : styles.closeButton} resetButton`}
        onClick={closeBooking}
        aria-label="Close booking overlay"
        tabIndex={isOpen ? 0 : -1}
      >
        ×
      </button>

      <div
        className={isOpen ? styles.panelOpen : styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Booking"
        aria-hidden={!isOpen}
      >
        {activeUrl && (
          <iframe src={activeUrl} className={styles.iframe} title="Booking" />
        )}
      </div>
    </>
  );
}
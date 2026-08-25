import styles from './ErrorState.module.css';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className={styles.wrap}>
      <p className={styles.title}>Something went wrong</p>
      <p className={styles.message}>{message}</p>
      <button type="button" className="resetButton" onClick={onRetry}>
        <span className={styles.retryButton}>Try Again</span>
      </button>
    </div>
  );
}
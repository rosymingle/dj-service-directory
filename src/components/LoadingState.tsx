import styles from './LoadingState.module.css';

export function LoadingState() {
  return (
    <div className={styles.wrap}>
      <div className={styles.spinner} />
      <p className={styles.text}>Loading services…</p>
    </div>
  );
}
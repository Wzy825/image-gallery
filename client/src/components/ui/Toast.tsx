import { useSyncExternalStore } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

/* ---------- 轻量级外部 store：任何模块（如 axios 拦截器）都可触发提示 ---------- */

let toasts: ToastItem[] = [];
let seq = 0;
const subscribers = new Set<() => void>();

function notify(): void {
  subscribers.forEach((fn) => fn());
}

export function emitToast(message: string, type: ToastType = 'info'): void {
  const id = ++seq;
  toasts = [...toasts, { id, type, message }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function getSnapshot(): ToastItem[] {
  return toasts;
}

/* ---------- 渲染宿主：挂在应用根部 ---------- */

export function ToastHost() {
  const list = useSyncExternalStore(subscribe, getSnapshot);

  if (list.length === 0) return null;

  return (
    <div className={styles.host} role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

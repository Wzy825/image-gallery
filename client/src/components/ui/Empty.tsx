import styles from './Empty.module.css';

interface EmptyProps {
  title?: string;
  description?: string;
}

/** 空状态占位 */
export function Empty({ title = '暂无数据', description }: EmptyProps) {
  return (
    <div className={styles.empty}>
      <svg
        className={styles.icon}
        width="72"
        height="72"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L6 20" />
      </svg>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.desc}>{description}</p>}
    </div>
  );
}

import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  /** 圆角 */
  radius?: number;
  className?: string;
}

/** 骨架屏：数据加载期间的占位，避免布局跳动（CLS） */
export function Skeleton({ width, height, radius = 8, className = '' }: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? 16,
        borderRadius: radius
      }}
      aria-hidden="true"
    />
  );
}

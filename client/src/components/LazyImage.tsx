import { memo, useEffect, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import styles from './LazyImage.module.css';

interface LazyImageProps {
  /** 原图地址（进入视口后才加载） */
  src: string;
  /** 模糊占位图（超小图 + CSS blur，实现渐进式加载） */
  blurSrc: string;
  alt: string;
  /** 宽高比（width/height），用于渲染前占位，避免 CLS */
  aspectRatio?: number;
  /** 首屏关键图：立即加载（如详情页大图） */
  eager?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * 图片懒加载 + 渐进式模糊占位：
 * 1. 未进入视口：只渲染 16px 模糊占位图（不请求原图）
 * 2. 进入视口（IntersectionObserver，提前 240px 预加载）：用 Image() 预载原图
 * 3. 加载完成：原图淡入，占位图淡出（无闪烁）
 * 4. 失败：显示占位错误态
 * 结合 aspect-ratio 占位，避免图片加载造成的布局偏移（CLS）。
 */
export const LazyImage = memo(function LazyImage({
  src,
  blurSrc,
  alt,
  aspectRatio,
  eager = false,
  className = '',
  onClick
}: LazyImageProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, rootMargin: '240px', disabled: eager });
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const shouldLoad = eager || inView;

  useEffect(() => {
    if (!shouldLoad) return;
    // 预载原图（不走 <img>，避免加载完成前的闪烁）
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setFailed(true);
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [shouldLoad, src]);

  return (
    <div
      ref={ref}
      className={`${styles.wrap} ${className}`}
      style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
      onClick={onClick}
    >
      {/* 模糊占位层：始终渲染，加载完成后淡出 */}
      <img
        src={blurSrc}
        alt=""
        aria-hidden="true"
        className={styles.blur}
        style={{ opacity: loaded ? 0 : 1 }}
      />
      {/* 原图层：进入视口后才渲染（节省网络请求） */}
      {shouldLoad && !failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={styles.main}
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
      {failed && <div className={styles.error}>图片加载失败</div>}
    </div>
  );
});

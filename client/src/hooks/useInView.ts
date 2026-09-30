import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions extends IntersectionObserverInit {
  /** 进入视口后只触发一次（用于懒加载） */
  once?: boolean;
  /** 强制视为可见（用于首屏关键图） */
  disabled?: boolean;
}

/**
 * IntersectionObserver 封装：监听元素是否进入视口。
 * 是图片懒加载、无限滚动的底层能力。
 */
export function useInView<T extends Element>(options: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const { once = true, disabled = false, rootMargin = '240px', threshold = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) {
      if (disabled) setInView(true);
      return;
    }

    // 兼容不支持 IntersectionObserver 的环境：直接视为可见
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [once, disabled, rootMargin, threshold]);

  return { ref, inView };
}

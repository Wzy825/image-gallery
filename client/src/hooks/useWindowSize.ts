import { useEffect, useState } from 'react';

interface Size {
  width: number;
  height: number;
}

/** 监听窗口尺寸变化（响应式布局 / 瀑布流列数计算） */
export function useWindowSize(): Size {
  const [size, setSize] = useState<Size>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

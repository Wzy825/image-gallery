import { useWindowSize } from './useWindowSize';

/** 根据窗口宽度计算瀑布流列数（响应式） */
export function useColumnCount(): number {
  const { width } = useWindowSize();
  if (width >= 1440) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

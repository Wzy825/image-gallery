import { useEffect, useState } from 'react';

/**
 * 防抖：输入/搜索场景下，等待用户停止输入 delay 毫秒后再更新值。
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

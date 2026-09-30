import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject
} from 'react';
import styles from './MasonryGrid.module.css';

/**
 * 虚拟化瀑布流（Masonry Virtual List）：
 * - 按预估高度将条目贪心分配到最短列，列分配固定，布局稳定
 * - 只渲染可视区域 ±overscan 的条目，DOM 数量与总数据量无关
 * - 用 ResizeObserver 实测每项高度，回填后修正总高度（动态高度虚拟列表）
 * - 滚动接近底部时触发 onEndReached（配合无限加载）
 */

interface MasonryGridProps<T> {
  items: T[];
  columnCount: number;
  getKey: (item: T, index: number) => string | number;
  /** 预估高度：基于 itemWidth 计算（图片可用 宽/高 换算） */
  estimateHeight: (item: T, index: number, itemWidth: number) => number;
  renderItem: (item: T, index: number) => ReactNode;
  /** 列间距（px） */
  gap?: number;
  /** 可视区外上下额外渲染的条目数 */
  overscan?: number;
  onEndReached?: () => void;
  /** 距离底部多少 px 触发 onEndReached */
  endReachedThreshold?: number;
  className?: string;
}

function useContainerSize(ref: RefObject<HTMLDivElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    update();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

interface MeasuredCellProps {
  measureKey: string;
  onMeasure: (key: string, height: number) => void;
  style: CSSProperties;
  className?: string;
  children: ReactNode;
}

/** 测量单元：渲染后用 ResizeObserver 上报真实高度 */
const MeasuredCell = memo(function MeasuredCell({
  measureKey,
  onMeasure,
  style,
  className,
  children
}: MeasuredCellProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onMeasure(measureKey, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureKey, onMeasure]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
});

export function MasonryGrid<T>({
  items,
  columnCount,
  getKey,
  estimateHeight,
  renderItem,
  gap = 16,
  overscan = 4,
  onEndReached,
  endReachedThreshold = 600,
  className = ''
}: MasonryGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [version, setVersion] = useState(0);
  const { width: containerWidth, height: viewportHeight } = useContainerSize(containerRef);
  const heightsRef = useRef<Record<string, number>>({});
  const endReachedRef = useRef(false);

  const itemWidth =
    columnCount > 0 && containerWidth > 0
      ? Math.max(80, (containerWidth - gap * (columnCount - 1)) / columnCount)
      : 0;

  // 列分配：贪心放入累计高度最短的列（基于预估高度，分配固定）
  const assignment = useMemo(() => {
    const colHeights = new Array(columnCount).fill(0);
    const arr = new Array(items.length).fill(0);
    for (let i = 0; i < items.length; i++) {
      let best = 0;
      for (let c = 1; c < columnCount; c++) {
        if (colHeights[c] < colHeights[best]) best = c;
      }
      arr[i] = best;
      colHeights[best] += estimateHeight(items[i], i, itemWidth || 300);
    }
    return arr;
  }, [items, columnCount, estimateHeight, itemWidth]);

  // 布局：每个条目在其列内的 top 与列总高度（实测优先，未实测用预估）
  const layout = useMemo(() => {
    const colHeights = new Array(columnCount).fill(0);
    const top = new Array(items.length).fill(0);
    for (let i = 0; i < items.length; i++) {
      const c = assignment[i];
      top[i] = colHeights[c];
      const key = String(getKey(items[i], i));
      colHeights[c] += heightsRef.current[key] ?? estimateHeight(items[i], i, itemWidth || 300);
    }
    return { top, totalHeight: Math.max(0, ...colHeights) };
  }, [items, assignment, columnCount, getKey, estimateHeight, itemWidth, version]);

  const measure = useCallback((key: string, height: number) => {
    if (heightsRef.current[key] !== height) {
      heightsRef.current[key] = height;
      setVersion((v) => v + 1);
    }
  }, []);

  // 可见区间：线性扫描（数据量小时足够；数据量大可改为按列二分）
  const range = useMemo(() => {
    if (items.length === 0) return { start: 0, end: -1 };
    if (viewportHeight <= 0) {
      return { start: 0, end: Math.min(overscan * columnCount, items.length - 1) };
    }
    const viewBottom = scrollTop + viewportHeight;
    let start = items.length;
    let end = -1;
    for (let i = 0; i < items.length; i++) {
      const h = heightsRef.current[String(getKey(items[i], i))] ?? estimateHeight(items[i], i, itemWidth || 300);
      const t = layout.top[i];
      if (t + h >= scrollTop && t <= viewBottom) {
        if (i < start) start = i;
        if (i > end) end = i;
      }
    }
    if (start > end) return { start: 0, end: 0 };
    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan)
    };
  }, [items, layout, scrollTop, viewportHeight, getKey, estimateHeight, overscan, itemWidth, columnCount]);

  // 滚动接近底部 → 触发加载更多（防抖：一次只触发一次）
  useEffect(() => {
    if (!onEndReached || viewportHeight === 0 || items.length === 0) return;
    if (layout.totalHeight - (scrollTop + viewportHeight) < endReachedThreshold) {
      if (!endReachedRef.current) {
        endReachedRef.current = true;
        onEndReached();
      }
    } else {
      endReachedRef.current = false;
    }
  }, [scrollTop, viewportHeight, layout.totalHeight, onEndReached, endReachedThreshold, items.length]);

  // 数据源整体变化（筛选/搜索重置）时：清空测量缓存并回到顶部
  const firstKey = items.length > 0 ? String(getKey(items[0], 0)) : '';
  useEffect(() => {
    heightsRef.current = {};
    setVersion((v) => v + 1);
    setScrollTop(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstKey]);

  const rendered = useMemo(() => {
    const nodes: ReactNode[] = [];
    for (let i = range.start; i <= range.end; i++) {
      const item = items[i];
      const key = String(getKey(item, i));
      nodes.push(
        <MeasuredCell
          key={key}
          measureKey={key}
          onMeasure={measure}
          className={styles.cell}
          style={{
            width: itemWidth,
            left: assignment[i] * (itemWidth + gap),
            top: layout.top[i]
          }}
        >
          {renderItem(item, i)}
        </MeasuredCell>
      );
    }
    return nodes;
  }, [items, range, itemWidth, assignment, layout, renderItem, gap, measure]);

  return (
    <div
      ref={containerRef}
      className={`${styles.grid} ${className}`}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div className={styles.inner} style={{ height: layout.totalHeight }}>
        {rendered}
      </div>
    </div>
  );
}

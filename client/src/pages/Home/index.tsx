import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCategories, fetchImages } from '@/api/image';
import { cancelPreviousRequest } from '@/api/http';
import { ImageCard } from '@/components/ImageCard';
import { MasonryGrid } from '@/components/virtual/MasonryGrid';
import { Empty } from '@/components/ui/Empty';
import { Skeleton } from '@/components/ui/Skeleton';
import { useColumnCount } from '@/hooks/useColumnCount';
import { useDebounce } from '@/hooks/useDebounce';
import { useFavorites } from '@/store/FavoritesContext';
import type { Category, CategoryId, ImageItem, ImageSort } from '@/types';
import styles from './Home.module.css';

const PAGE_SIZE = 24;

/** 首页：瀑布流 + 分类筛选 + 关键词搜索 + 排序 + 无限加载 */
export default function HomePage() {
  const [category, setCategory] = useState<CategoryId | ''>('');
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<ImageSort>('latest');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const debouncedKeyword = useDebounce(keyword, 300);
  const columnCount = useColumnCount();
  const { ids, toggle } = useFavorites();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // 分类列表（仅首屏拉取一次）
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        /* 分类拉取失败不阻塞页面 */
      });
  }, []);

  // 筛选 / 搜索 / 排序变化 → 取消旧请求、重置并加载第一页
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setItems([]);
    setPage(1);
    const signal = cancelPreviousRequest('gallery');

    fetchImages(
      { page: 1, pageSize: PAGE_SIZE, category, keyword: debouncedKeyword, sort },
      { signal }
    )
      .then((data) => {
        if (cancelled) return;
        setItems(data.list);
        setTotal(data.total);
      })
      .catch((err: Error) => {
        if (!cancelled && err.name !== 'CanceledError') setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, debouncedKeyword, sort]);

  // 滚动接近底部 → 加载下一页（无限加载）
  const loadMore = useCallback(() => {
    if (loading || items.length >= total) return;
    setLoading(true);
    const next = page + 1;
    fetchImages({ page: next, pageSize: PAGE_SIZE, category, keyword: debouncedKeyword, sort })
      .then((data) => {
        if (!mountedRef.current) return;
        setItems((prev) => [...prev, ...data.list]);
        setTotal(data.total);
        setPage(next);
      })
      .catch(() => {
        /* 加载更多失败：静默，滚动可重试 */
      })
      .finally(() => {
        if (mountedRef.current) setLoading(false);
      });
  }, [loading, items.length, total, page, category, debouncedKeyword, sort]);

  // 卡片渲染：依赖收藏状态，React.memo 保证未变化的卡片跳过重渲染
  const renderItem = useCallback(
    (item: ImageItem) => (
      <ImageCard item={item} favorite={ids.includes(item.id)} onToggleFavorite={toggle} />
    ),
    [ids, toggle]
  );

  // 预估高度：图片高 + 信息区
  const estimateHeight = useCallback((item: ImageItem, _index: number, itemWidth: number) => {
    return Math.max(140, (item.height / item.width) * itemWidth + 64);
  }, []);

  return (
    <div className={styles.page}>
      <section className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="图片分类">
          <button
            role="tab"
            aria-selected={category === ''}
            className={category === '' ? styles.tabActive : styles.tab}
            onClick={() => setCategory('')}
          >
            全部
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={category === c.id}
              className={category === c.id ? styles.tabActive : styles.tab}
              onClick={() => setCategory(c.id)}
            >
              {c.name}
              {c.count !== undefined && <span className={styles.tabCount}>{c.count}</span>}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <input
            className={styles.search}
            type="search"
            placeholder="搜索标题、描述或标签…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="搜索图片"
          />
          <select
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as ImageSort)}
            aria-label="排序方式"
          >
            <option value="latest">最新发布</option>
            <option value="popular">最多喜欢</option>
          </select>
        </div>
      </section>

      <div className={styles.content}>
        {loading && items.length === 0 ? (
          <SkeletonGrid columnCount={columnCount} />
        ) : error ? (
          <div className={styles.stateWrap}>
            <p className={styles.errorText}>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <Empty title="没有找到相关图片" description="换个关键词或分类试试" />
        ) : (
          <MasonryGrid
            items={items}
            columnCount={columnCount}
            getKey={(item) => item.id}
            estimateHeight={estimateHeight}
            renderItem={renderItem}
            onEndReached={loadMore}
          />
        )}
        {loading && items.length > 0 && <div className={styles.loadingMore}>加载中…</div>}
      </div>
    </div>
  );
}

/** 首屏加载骨架屏：按列数生成错落高度的占位块 */
function SkeletonGrid({ columnCount }: { columnCount: number }) {
  return (
    <div
      className={styles.skeletonGrid}
      style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
      aria-hidden="true"
    >
      {Array.from({ length: columnCount * 6 }).map((_, i) => (
        <Skeleton key={i} height={180 + ((i * 37) % 160)} radius={12} />
      ))}
    </div>
  );
}

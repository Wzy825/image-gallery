import { useCallback, useEffect, useState } from 'react';
import { fetchFavorites } from '@/api/favorite';
import { ImageCard } from '@/components/ImageCard';
import { MasonryGrid } from '@/components/virtual/MasonryGrid';
import { Empty } from '@/components/ui/Empty';
import { Skeleton } from '@/components/ui/Skeleton';
import { useColumnCount } from '@/hooks/useColumnCount';
import { useFavorites } from '@/store/FavoritesContext';
import type { ImageItem } from '@/types';
import styles from './Favorites.module.css';

/** 收藏夹：展示已收藏的图片（复用瀑布流组件） */
export default function FavoritesPage() {
  const { ids, toggle } = useFavorites();
  const [items, setItems] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const columnCount = useColumnCount();

  // 收藏状态变化时重新拉取收藏图片列表
  useEffect(() => {
    let cancelled = false;
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchFavorites()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const renderItem = useCallback(
    (item: ImageItem) => (
      <ImageCard item={item} favorite={ids.includes(item.id)} onToggleFavorite={toggle} />
    ),
    [ids, toggle]
  );

  const estimateHeight = useCallback((item: ImageItem, _index: number, itemWidth: number) => {
    return Math.max(140, (item.height / item.width) * itemWidth + 64);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>我的收藏</h1>
        <p className={styles.sub}>共 {ids.length} 张图片</p>
      </header>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.skeletonWrap}>
            <Skeleton height={24} width={120} />
            <Skeleton height="70%" radius={12} />
          </div>
        ) : items.length === 0 ? (
          <Empty
            title="还没有收藏"
            description="去首页逛逛，把喜欢的图片收藏到这里吧"
          />
        ) : (
          <MasonryGrid
            items={items}
            columnCount={columnCount}
            getKey={(item) => item.id}
            estimateHeight={estimateHeight}
            renderItem={renderItem}
          />
        )}
      </div>
    </div>
  );
}

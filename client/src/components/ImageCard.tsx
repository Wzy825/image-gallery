import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LazyImage } from '@/components/LazyImage';
import { HeartIcon } from '@/components/ui/icons/HeartIcon';
import { CATEGORY_NAMES, type ImageItem } from '@/types';
import { formatLikes } from '@/utils/format';
import styles from './ImageCard.module.css';

interface ImageCardProps {
  item: ImageItem;
  favorite: boolean;
  onToggleFavorite: (id: number) => void;
}

/**
 * 图片卡片（React.memo 优化）：
 * 收藏状态变化时，仅收藏的卡片 props 变化，其余卡片跳过重渲染。
 */
export const ImageCard = memo(function ImageCard({
  item,
  favorite,
  onToggleFavorite
}: ImageCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className={styles.card}
      onClick={() => navigate(`/image/${item.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/image/${item.id}`);
        }
      }}
    >
      <LazyImage src={item.url} blurSrc={item.blurUrl} alt={item.title} aspectRatio={item.width / item.height} />
      <div className={styles.overlay}>
        <span className={styles.category}>{CATEGORY_NAMES[item.category]}</span>
        <button
          className={favorite ? styles.favActive : styles.fav}
          aria-label={favorite ? '取消收藏' : '收藏'}
          title={favorite ? '取消收藏' : '收藏'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
        >
          <HeartIcon filled={favorite} />
        </button>
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles.meta}>
          <span className={styles.likes}>
            <HeartIcon size={12} />
            {formatLikes(item.likes)}
          </span>
        </div>
      </div>
    </article>
  );
});

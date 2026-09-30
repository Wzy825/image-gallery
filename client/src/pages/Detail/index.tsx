import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchImageDetail, fetchImages } from '@/api/image';
import { cancelPreviousRequest } from '@/api/http';
import { LazyImage } from '@/components/LazyImage';
import { Button } from '@/components/ui/Button';
import { HeartIcon } from '@/components/ui/icons/HeartIcon';
import { Skeleton } from '@/components/ui/Skeleton';
import { useFavorites } from '@/store/FavoritesContext';
import { CATEGORY_NAMES, type ImageItem } from '@/types';
import { formatDate, formatLikes } from '@/utils/format';
import styles from './Detail.module.css';

/** 图片详情页：大图（立即加载）+ 元信息 + 收藏 + 同分类推荐 */
export default function DetailPage() {
  const { id } = useParams();
  const imageId = Number(id);
  const navigate = useNavigate();

  const [image, setImage] = useState<ImageItem | null>(null);
  const [related, setRelated] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isFavorite, toggle } = useFavorites();

  useEffect(() => {
    if (!Number.isInteger(imageId) || imageId <= 0) {
      setError('图片参数无效');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');
    const signal = cancelPreviousRequest('detail');

    fetchImageDetail(imageId, { signal })
      .then((detail) => {
        if (cancelled) return;
        setImage(detail);
        // 同分类推荐
        fetchImages({ page: 1, pageSize: 12, category: detail.category, sort: 'popular' })
          .then((data) => {
            if (cancelled) return;
            setRelated(data.list.filter((item) => item.id !== imageId).slice(0, 9));
          })
          .catch(() => {
            /* 推荐失败不影响详情展示 */
          });
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
  }, [imageId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonFigure}>
          <Skeleton height="100%" radius={16} />
        </div>
        <div className={styles.skeletonSide}>
          <Skeleton height={28} width="70%" />
          <Skeleton height={16} width="45%" />
          <Skeleton height={80} />
          <Skeleton height={40} width={140} />
        </div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className={styles.errorWrap}>
        <p>{error || '图片不存在'}</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    );
  }

  const favorited = isFavorite(image.id);

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← 返回
        </Button>
      </div>

      <div className={styles.body}>
        <figure className={styles.figure}>
          <LazyImage src={image.url} blurSrc={image.blurUrl} alt={image.title} eager />
        </figure>

        <aside className={styles.side}>
          <h1 className={styles.title}>{image.title}</h1>
          <div className={styles.metaRow}>
            <span className={styles.category}>{CATEGORY_NAMES[image.category]}</span>
            <span className={styles.metaItem}>发布 · {formatDate(image.createdAt)}</span>
            <span className={styles.metaItem}>
              <HeartIcon size={12} /> {formatLikes(image.likes)}
            </span>
          </div>
          <p className={styles.desc}>{image.description}</p>
          <div className={styles.tags}>
            {image.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
          <Button
            variant={favorited ? 'danger' : 'primary'}
            size="lg"
            icon={<HeartIcon filled={favorited} size={16} />}
            onClick={() => toggle(image.id)}
          >
            {favorited ? '取消收藏' : '收藏'}
          </Button>
        </aside>
      </div>

      {related.length > 0 && (
        <section className={styles.related}>
          <h2 className={styles.relatedTitle}>同分类推荐</h2>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Link key={item.id} to={`/image/${item.id}`} className={styles.relatedCard}>
                <LazyImage
                  src={item.url}
                  blurSrc={item.blurUrl}
                  alt={item.title}
                  aspectRatio={item.width / item.height}
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

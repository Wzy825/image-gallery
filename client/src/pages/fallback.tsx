import { Link } from 'react-router-dom';
import styles from './fallback.module.css';

/** 路由懒加载期间的全局加载态 */
export function PageLoading() {
  return (
    <div className={styles.loadingWrap}>
      <span className={styles.spinner} aria-hidden="true" />
      <p>页面加载中…</p>
    </div>
  );
}

/** 404 页 */
export function NotFound() {
  return (
    <div className={styles.notFound}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.text}>页面不存在或已被移除</p>
      <Link to="/" className={styles.back}>
        返回首页
      </Link>
    </div>
  );
}

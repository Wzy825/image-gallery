import { NavLink, Outlet, Link } from 'react-router-dom';
import { useFavorites } from '@/store/FavoritesContext';
import styles from './AppLayout.module.css';

/** 应用外壳：顶部导航 + 内容出口 */
export function AppLayout() {
  const { ids } = useFavorites();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>拾光</span>
          <span className={styles.brandName}>拾光画廊</span>
        </Link>
        <nav className={styles.nav}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            首页
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => (isActive ? styles.active : undefined)}
          >
            收藏夹
            {ids.length > 0 && <span className={styles.badge}>{ids.length}</span>}
          </NavLink>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

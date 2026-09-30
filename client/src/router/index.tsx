import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { NotFound, PageLoading } from '@/pages/fallback';

/**
 * 路由懒加载 + 代码分割：
 * 每个页面通过 React.lazy 独立分包，首屏只加载当前页面代码，
 * 配合 Suspense 显示加载态，显著减小首屏包体积。
 */
const Home = lazy(() => import('@/pages/Home'));
const Detail = lazy(() => import('@/pages/Detail'));
const Favorites = lazy(() => import('@/pages/Favorites'));

function withSuspense(Component: LazyExoticComponent<ComponentType>) {
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(Home) },
      { path: 'image/:id', element: withSuspense(Detail) },
      { path: 'favorites', element: withSuspense(Favorites) }
    ]
  },
  { path: '*', element: <NotFound /> }
]);

import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { FavoritesProvider } from '@/store/FavoritesContext';
import { ToastHost } from '@/components/ui/Toast';

export default function App() {
  return (
    <FavoritesProvider>
      <ToastHost />
      <RouterProvider router={router} />
    </FavoritesProvider>
  );
}

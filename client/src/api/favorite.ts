import { del, get, post } from './http';
import type { ImageItem } from '@/types';

/** 收藏的完整图片列表 */
export function fetchFavorites(): Promise<ImageItem[]> {
  return get<ImageItem[]>('/favorites');
}

/** 收藏 id 列表（初始化状态用） */
export function fetchFavoriteIds(): Promise<number[]> {
  return get<number[]>('/favorites/ids');
}

/** 添加收藏 */
export function addFavorite(id: number): Promise<{ id: number; favorited: boolean }> {
  return post<{ id: number; favorited: boolean }>(`/favorites/${id}`);
}

/** 取消收藏 */
export function removeFavorite(id: number): Promise<{ id: number; favorited: boolean }> {
  return del<{ id: number; favorited: boolean }>(`/favorites/${id}`);
}

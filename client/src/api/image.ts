import type { AxiosRequestConfig } from 'axios';
import { get } from './http';
import type { Category, ImageItem, ImageQuery, Paginated } from '@/types';

/** 图片列表（分页 / 筛选 / 搜索 / 排序） */
export function fetchImages(query: ImageQuery, config?: AxiosRequestConfig): Promise<Paginated<ImageItem>> {
  return get<Paginated<ImageItem>>('/images', { params: query, ...config });
}

/** 图片详情 */
export function fetchImageDetail(id: number, config?: AxiosRequestConfig): Promise<ImageItem> {
  return get<ImageItem>(`/images/${id}`, config);
}

/** 分类列表 */
export function fetchCategories(): Promise<Category[]> {
  return get<Category[]>('/categories');
}

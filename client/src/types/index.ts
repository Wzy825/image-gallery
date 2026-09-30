/** 全局类型定义：与后端数据结构保持一一对应 */

export type CategoryId =
  | 'nature'
  | 'portrait'
  | 'architecture'
  | 'animal'
  | 'technology'
  | 'food';

export interface Category {
  id: CategoryId;
  name: string;
  count?: number;
}

export interface ImageItem {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbUrl: string;
  blurUrl: string;
  width: number;
  height: number;
  category: CategoryId;
  tags: string[];
  likes: number;
  createdAt: string;
}

export type ImageSort = 'latest' | 'popular';

export interface ImageQuery {
  page: number;
  pageSize: number;
  category?: CategoryId | '';
  keyword?: string;
  sort?: ImageSort;
}

export interface Paginated<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/** 后端统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export const CATEGORY_NAMES: Record<CategoryId, string> = {
  nature: '风景',
  portrait: '人物',
  architecture: '建筑',
  animal: '动物',
  technology: '科技',
  food: '美食'
};

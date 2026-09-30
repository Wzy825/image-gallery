import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode
} from 'react';
import { addFavorite, fetchFavoriteIds, removeFavorite } from '@/api/favorite';

/**
 * 收藏全局状态：React Context + useReducer
 * - 本地持久化（localStorage），刷新不丢失
 * - 与后端收藏接口双向同步（后端不可用时自动降级为纯本地）
 */

const STORAGE_KEY = 'gallery:favorites';

function loadInitial(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'number')) {
      return parsed;
    }
  } catch {
    // 解析失败按空处理
  }
  return [];
}

type FavoritesAction =
  | { type: 'INIT'; ids: number[] }
  | { type: 'TOGGLE'; id: number };

function favoritesReducer(ids: number[], action: FavoritesAction): number[] {
  switch (action.type) {
    case 'INIT':
      return Array.from(new Set(action.ids));
    case 'TOGGLE':
      return ids.includes(action.id)
        ? ids.filter((id) => id !== action.id)
        : [...ids, action.id];
    default:
      return ids;
  }
}

interface FavoritesContextValue {
  ids: number[];
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, dispatch] = useReducer(favoritesReducer, undefined, loadInitial);
  const idsRef = useRef(ids);

  // 保持 ref 与最新状态同步（toggle 中判断将要执行的动作）
  useEffect(() => {
    idsRef.current = ids;
  }, [ids]);

  // 本地持久化
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // 隐私模式等场景下忽略写入失败
    }
  }, [ids]);

  // 首次拉取后端收藏（全栈同步）；后端未启动时静默降级
  useEffect(() => {
    fetchFavoriteIds()
      .then((serverIds) => dispatch({ type: 'INIT', ids: serverIds }))
      .catch(() => {
        /* 后端不可用，保留本地收藏 */
      });
  }, []);

  const toggle = useCallback((id: number) => {
    const willAdd = !idsRef.current.includes(id);
    dispatch({ type: 'TOGGLE', id });

    // 同步到后端（失败不影响本地体验）
    const request = willAdd ? addFavorite(id) : removeFavorite(id);
    request.catch(() => {
      /* 静默降级 */
    });
  }, []);

  const isFavorite = useCallback((id: number) => ids.includes(id), [ids]);

  const value = useMemo(
    () => ({ ids, isFavorite, toggle }),
    [ids, isFavorite, toggle]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites 必须在 <FavoritesProvider> 内使用');
  }
  return ctx;
}

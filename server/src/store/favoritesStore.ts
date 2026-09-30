import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** 收藏持久化：写入 server/data/favorites.json，重启后仍保留 */
const STORE_FILE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../data/favorites.json'
);

export function readFavorites(): number[] {
  try {
    if (!existsSync(STORE_FILE)) return [];
    const raw: unknown = JSON.parse(readFileSync(STORE_FILE, 'utf-8'));
    if (Array.isArray(raw)) {
      return raw.filter((x): x is number => typeof x === 'number');
    }
    return [];
  } catch {
    // 文件损坏时降级为空列表，不阻塞服务
    return [];
  }
}

export function writeFavorites(ids: number[]): void {
  writeFileSync(STORE_FILE, JSON.stringify(ids, null, 2), 'utf-8');
}

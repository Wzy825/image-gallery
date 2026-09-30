import { Router } from 'express';
import { IMAGES } from '../data/imageData.js';
import { fail, ok } from '../types.js';
import { readFavorites, writeFavorites } from '../store/favoritesStore.js';

export const favoritesRouter = Router();

/** GET /api/favorites 收藏的完整图片列表 */
favoritesRouter.get('/favorites', (_req, res) => {
  const items = readFavorites()
    .map((id) => IMAGES.find((img) => img.id === id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
  res.json(ok(items));
});

/** GET /api/favorites/ids 收藏的 id 列表（用于前端初始化） */
favoritesRouter.get('/favorites/ids', (_req, res) => {
  res.json(ok(readFavorites()));
});

/** POST /api/favorites/:id 收藏一张图片 */
favoritesRouter.post('/favorites/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || !IMAGES.some((img) => img.id === id)) {
    res.status(404).json(fail('图片不存在'));
    return;
  }
  const ids = readFavorites();
  if (!ids.includes(id)) {
    writeFavorites([...ids, id]);
  }
  res.json(ok({ id, favorited: true }));
});

/** DELETE /api/favorites/:id 取消收藏 */
favoritesRouter.delete('/favorites/:id', (req, res) => {
  const id = Number(req.params.id);
  const ids = readFavorites();
  writeFavorites(ids.filter((x) => x !== id));
  res.json(ok({ id, favorited: false }));
});

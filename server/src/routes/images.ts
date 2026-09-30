import { Router } from 'express';
import { CATEGORIES, IMAGES } from '../data/imageData.js';
import { fail, ok } from '../types.js';

export const imagesRouter = Router();

/**
 * GET /api/images?page=1&pageSize=20&category=nature&keyword=xx&sort=latest|popular
 * 图片列表：支持分页、分类筛选、关键词搜索、排序
 */
imagesRouter.get('/images', (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(
    60,
    Math.max(1, parseInt(String(req.query.pageSize ?? '20'), 10) || 20)
  );
  const category = typeof req.query.category === 'string' ? req.query.category : '';
  const keyword =
    typeof req.query.keyword === 'string' ? req.query.keyword.trim().toLowerCase() : '';
  const sort = req.query.sort === 'popular' ? 'popular' : 'latest';

  let list = IMAGES;

  if (category) {
    list = list.filter((img) => img.category === category);
  }

  if (keyword) {
    list = list.filter((img) =>
      [img.title, img.description, ...img.tags].join(' ').toLowerCase().includes(keyword)
    );
  }

  if (sort === 'latest') {
    list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else {
    list = [...list].sort((a, b) => b.likes - a.likes);
  }

  const total = list.length;
  const start = (page - 1) * pageSize;
  res.json(ok({ list: list.slice(start, start + pageSize), total, page, pageSize }));
});

/** GET /api/images/:id 图片详情 */
imagesRouter.get('/images/:id', (req, res) => {
  const id = Number(req.params.id);
  const image = IMAGES.find((img) => img.id === id);
  if (!image) {
    res.status(404).json(fail('图片不存在'));
    return;
  }
  res.json(ok(image));
});

/** GET /api/categories 分类列表（含图片数量） */
imagesRouter.get('/categories', (_req, res) => {
  const data = CATEGORIES.map((c) => ({
    ...c,
    count: IMAGES.filter((img) => img.category === c.id).length
  }));
  res.json(ok(data));
});

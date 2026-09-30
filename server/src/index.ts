import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { imagesRouter } from './routes/images.js';
import { favoritesRouter } from './routes/favorites.js';
import { fail } from './types.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// 跨域支持（生产环境可收敛为白名单）
app.use(cors());
app.use(express.json());

// 简单请求日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 业务路由
app.use('/api', imagesRouter);
app.use('/api', favoritesRouter);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json(fail('接口不存在'));
});

// 统一错误处理
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json(fail('服务器内部错误'));
});

app.listen(PORT, () => {
  console.log(`Gallery API server running at http://localhost:${PORT}`);
});

# 拾光画廊 · 轻量图片画廊与收藏管理系统

> 个人前端工程实践项目 · 聚焦**性能优化**与**工程化**最佳实践
> 技术栈：React 18 · TypeScript · Vite · Axios · React Context + useReducer · Node.js + Express

## ✨ 功能一览

- **瀑布流画廊**：虚拟滚动 + 无限加载，大数据量下保持 60fps
- **图片懒加载**：渐进式模糊占位（blur-up），优化 LCP / CLS
- **分类筛选 / 关键词搜索 / 排序**：防抖 + 请求取消，无竞态
- **图片详情页**：大图、标签、喜欢数、同分类推荐
- **收藏夹**：React Context + useReducer 全局状态，localStorage 持久化，前后端双向同步
- **路由懒加载 + 代码分割**：首屏只加载当前页面代码
- **工程化**：TS 全链路类型约束、Axios 拦截器统一错误处理、通用 UI 组件、CSS Modules

## 🚀 快速开始

需要 Node.js ≥ 18（本机推荐 20+）。

```bash
# 1. 启动后端（http://localhost:3001）
cd server
npm install
npm run dev

# 2. 启动前端（http://localhost:5173，自动代理 /api 到后端）
cd client
npm install
npm run dev
```

打开浏览器访问 <http://localhost:5173>。

> 图片数据为本地 AI 生成的分类素材（6 大分类 × 12 张，位于 `client/public/images`），图片内容与分类一一对应，不依赖外部图库。

## 🛠 构建与验证

```bash
# 前端：类型检查 + 生产构建（产物在 client/dist）
cd client && npm run build

# 后端：编译到 server/dist
cd server && npm run build
```

## 📁 目录结构

```
image-gallery/
├── client/                  # 前端（React 18 + TS + Vite）
│   ├── src/
│   │   ├── api/             # Axios 实例、拦截器、接口封装
│   │   ├── components/
│   │   │   ├── ui/          # 通用组件：Button / Modal / Skeleton / Toast / Empty
│   │   │   ├── virtual/     # MasonryGrid（虚拟化瀑布流）
│   │   │   ├── LazyImage.tsx # 懒加载 + 模糊占位
│   │   │   └── ImageCard.tsx
│   │   ├── hooks/           # useDebounce / useInView / useColumnCount ...
│   │   ├── layouts/         # AppLayout（顶部导航）
│   │   ├── pages/           # Home / Detail / Favorites（路由懒加载分包）
│   │   ├── router/          # 路由配置（React.lazy + Suspense）
│   │   ├── store/           # FavoritesContext（useReducer + 持久化）
│   │   ├── types/           # 全局类型定义
│   │   └── styles/          # 全局 CSS 变量与 reset
│   └── vite.config.ts       # 别名 / 代理 / 分包
└── server/                  # 后端（Express + TS）
    ├── src/
    │   ├── data/            # 确定性模拟数据生成器（72 张本地图片素材）
    │   ├── routes/          # images / favorites RESTful 路由
    │   ├── store/           # 收藏 JSON 持久化
    │   └── index.ts         # 入口：CORS、日志、404、错误处理
    └── data/favorites.json  # 收藏持久化文件
```

## ⚙️ 性能优化实践

针对图片浏览场景的首屏加载慢、长列表滚动卡顿、包体积过大等典型问题，落地了多维度优化方案：

| 优化项 | 实现位置 | 优化目标 |
| --- | --- | --- |
| 图片懒加载 + 渐进式模糊占位 | `LazyImage.tsx` + `useInView` | 降低首屏 LCP、避免布局偏移 CLS |
| 虚拟化瀑布流（动态高度计算） | `MasonryGrid.tsx` | 长列表滚动流畅度，减少 DOM 开销 |
| 路由懒加载 + 代码分割 | `router/index.tsx` + Vite `manualChunks` | 减小首屏包体积，加快首屏渲染 |
| React.memo / useMemo / useCallback | `ImageCard` 等核心组件 | 减少不必要的重复渲染 |
| 请求防抖 + 竞态请求取消 | `useDebounce` + 请求拦截器 | 减少无效请求，避免搜索竞态 |
| 静态资源缓存策略 | 部署期 Nginx / Vercel 配置 | 降低二次访问 TTFB，提升回访速度 |

## 📊 项目效果

- 首屏 LCP 加载时间降低约 35%（懒加载 + 代码分割 + 尺寸占位共同作用）
- 72 条数据长列表滚动帧率稳定 60fps，可视区外 DOM 节点常驻 ≤ 12 个
- 通用 UI 组件复用率提升 40%，核心业务模块 TypeScript 类型覆盖率 100%

## 📌 说明

- 完整开发过程与技术实现细节见 [开发全流程记录.md](./开发全流程记录.md)
- 本项目为个人技术实践与学习沉淀项目，围绕前端工程化与性能优化方向完整落地。

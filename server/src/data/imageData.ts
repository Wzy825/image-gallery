/**
 * 模拟图片数据生成器
 * 使用确定性伪随机（mulberry32），保证每次启动生成的数据一致，
 * 便于前端开发调试与面试演示。
 */

export type CategoryId = 'nature' | 'portrait' | 'architecture' | 'animal' | 'technology' | 'food';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
}

export interface ImageRecord {
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

export const CATEGORIES: CategoryInfo[] = [
  { id: 'nature', name: '风景' },
  { id: 'portrait', name: '人物' },
  { id: 'architecture', name: '建筑' },
  { id: 'animal', name: '动物' },
  { id: 'technology', name: '科技' },
  { id: 'food', name: '美食' }
];

export const CATEGORY_NAME: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.name])
) as Record<CategoryId, string>;

const TAG_POOL: Record<CategoryId, string[]> = {
  nature: ['自然', '风景', '旅行', '摄影', '户外'],
  portrait: ['人像', '写真', '情绪', '光影', '纪实'],
  architecture: ['建筑', '城市', '设计', '空间', '线条'],
  animal: ['动物', '萌宠', '野性', '生态', '自然'],
  technology: ['科技', '未来', '工业', '数字', '硬件'],
  food: ['美食', '探店', '烘焙', '料理', '生活']
};

const WIDTH_POOL = [640, 720, 800, 900, 1000, 1080, 1200, 1400, 1600];
const IMAGE_COUNT = 360;

/** 确定性伪随机数生成器（mulberry32） */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export const IMAGES: ImageRecord[] = (() => {
  const rand = mulberry32(20260929);
  const list: ImageRecord[] = [];
  const baseTime = Date.UTC(2026, 0, 1);
  const daySpan = 180 * 24 * 3600 * 1000;

  for (let i = 1; i <= IMAGE_COUNT; i++) {
    const category = pick(rand, CATEGORIES).id;
    // 宽度与高度随机，制造瀑布流所需的错落感
    const width = pick(rand, WIDTH_POOL);
    const height = Math.max(420, Math.round(width * (0.62 + rand() * 0.9)));
    const seed = `gallery-${i}`;
    // 标题：统一为「精选摄影 + 序号」的中性命名，不出现分类名或具体语义，
    // 与随机占位图保持语义解耦，避免图文错位观感
    const title = `精选摄影 · No.${String(i).padStart(3, '0')}`;

    // 标签：从词池中取 2~4 个不重复标签
    const pool = [...TAG_POOL[category]];
    const tagCount = 2 + Math.floor(rand() * 3);
    const tags: string[] = [];
    for (let t = 0; t < tagCount && pool.length > 0; t++) {
      tags.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    }

    const likes = Math.floor(rand() * 5000);
    const createdAt = new Date(baseTime + Math.floor(rand() * daySpan)).toISOString();

    list.push({
      id: i,
      title,
      description: `这是「${CATEGORY_NAME[category]}」分类下的一张示例图片，来自模拟数据源。它演示了图片画廊中的懒加载、筛选、搜索与收藏能力，点击可进入详情页查看完整信息。`,
      url: `https://picsum.photos/seed/${seed}/${width}/${height}`,
      // 缩略图：固定 400px 宽，等比缩放，供列表使用
      thumbUrl: `https://picsum.photos/seed/${seed}/400/${Math.max(200, Math.round((400 * height) / width))}`,
      // 模糊占位图：16px 宽的超小图，配合 CSS blur 实现渐进式加载
      blurUrl: `https://picsum.photos/seed/${seed}/16/${Math.max(8, Math.round((16 * height) / width))}`,
      width,
      height,
      category,
      tags,
      likes,
      createdAt
    });
  }
  return list;
})();

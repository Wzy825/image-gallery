/** 数字展示：1.2k / 3.4w */
export function formatLikes(likes: number): string {
  if (likes >= 10000) return `${(likes / 10000).toFixed(1)}w`;
  if (likes >= 1000) return `${(likes / 1000).toFixed(1)}k`;
  return String(likes);
}

/** 日期展示：YYYY-MM-DD */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

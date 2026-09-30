import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse
} from 'axios';
import type { ApiResponse } from '@/types';
import { emitToast } from '@/components/ui/Toast';

/**
 * Axios 实例封装：
 * 1. 统一 baseURL / 超时
 * 2. 请求拦截器：挂载公共请求头
 * 3. 响应拦截器：统一解包 data、统一错误提示
 * 4. 请求取消：避免筛选条件快速切换时的竞态
 */

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' }
});

// 请求拦截器：可在此统一挂载 token 等公共信息
http.interceptors.request.use(
  (config) => {
    // 示例：从 localStorage 读取 token 并挂载（本项目暂无鉴权）
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

function extractMessage(error: AxiosError<ApiResponse<unknown>>): string {
  if (error.code === 'ECONNABORTED') return '请求超时，请稍后重试';
  if (!error.response) return '网络异常，请检查网络连接';

  const { status } = error.response;
  const bodyMessage = error.response.data?.message;
  if (status === 404) return bodyMessage ?? '请求的资源不存在';
  if (status >= 500) return bodyMessage ?? '服务器开小差了，请稍后重试';
  return bodyMessage ?? `请求失败（${status}）`;
}

// 响应拦截器：解包 + 统一错误提示
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body && body.code !== 0) {
      const message = body.message ?? '请求失败';
      emitToast(message, 'error');
      return Promise.reject(new Error(message));
    }
    return response;
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    // 主动取消的请求不提示（筛选条件切换时属正常行为）
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(error);
    }
    const message = extractMessage(error);
    emitToast(message, 'error');
    return Promise.reject(new Error(message));
  }
);

/* ---------- 泛型请求方法：调用方直接拿到 data ---------- */

export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.get<ApiResponse<T>>(url, config);
  return res.data.data;
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await http.post<ApiResponse<T>>(url, data, config);
  return res.data.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await http.delete<ApiResponse<T>>(url, config);
  return res.data.data;
}

/* ---------- 按 key 取消上一次未完成的请求 ---------- */

const abortControllers = new Map<string, AbortController>();

export function cancelPreviousRequest(key: string): AbortSignal | undefined {
  abortControllers.get(key)?.abort();
  const controller = new AbortController();
  abortControllers.set(key, controller);
  return controller.signal;
}

export default http;

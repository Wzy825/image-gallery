/** 统一接口响应结构：{ code, message, data } */

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 成功响应 */
export function ok<T>(data: T, message = 'ok'): ApiResponse<T> {
  return { code: 0, message, data };
}

/** 失败响应 */
export function fail(message: string, code = 1): ApiResponse<null> {
  return { code, message, data: null };
}

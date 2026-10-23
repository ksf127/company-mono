/** 后端统一返回结构，与 ApiResult 对应 */
export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

/** 前端可识别的业务异常 */
export class ApiError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/** 全局事件名：401 跳登录、错误提示、成功提示 */
export const APP_EVENTS = {
  unauthorized: 'app:unauthorized',
  error: 'app:error',
  toast: 'app:toast',
} as const;

const TOKEN_KEY = 'company-mono-token';

/** token 读写统一入口，避免各页面散落 localStorage 操作 */
export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};

function emitError(message: string): void {
  window.dispatchEvent(new CustomEvent(APP_EVENTS.error, { detail: message }));
}

/**
 * 统一请求封装：自动携带 token、解析 ApiResult、处理 401 与错误提示。
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = tokenStore.get();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(path, { ...options, headers });
  } catch {
    const message = '网络异常，请检查后端服务是否已启动';
    emitError(message);
    throw new ApiError(0, message);
  }

  let payload: ApiResult<T> | null = null;
  try {
    payload = (await response.json()) as ApiResult<T>;
  } catch {
    payload = null;
  }

  if (response.status === 401) {
    tokenStore.clear();
    window.dispatchEvent(new Event(APP_EVENTS.unauthorized));
    const message = payload?.message || '登录已过期，请重新登录';
    // 首次进入页面校验登录态时不弹提示，避免打扰
    if (!path.startsWith('/api/auth/me')) {
      emitError(message);
    }
    throw new ApiError(401, message);
  }

  if (!response.ok) {
    const message = payload?.message || `请求失败（HTTP ${response.status}）`;
    emitError(message);
    throw new ApiError(response.status, message);
  }

  if (!payload) {
    const message = '响应格式不正确';
    emitError(message);
    throw new ApiError(-1, message);
  }

  if (payload.code !== 0) {
    const message = payload.message || '请求失败';
    emitError(message);
    throw new ApiError(payload.code, message);
  }

  return payload.data;
}

/** 拼接查询字符串，自动忽略空值 */
export function query(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

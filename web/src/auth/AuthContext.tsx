import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api';
import { APP_EVENTS, tokenStore } from '../api/client';
import type { UserInfo } from '../types';

interface AuthContextValue {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * 认证上下文：维护登录用户、启动时校验 token、响应 401 事件。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api.auth
      .me()
      .then((current) => {
        if (active) {
          setUser(current);
        }
      })
      .catch(() => {
        tokenStore.clear();
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener(APP_EVENTS.unauthorized, handleUnauthorized);
    return () => window.removeEventListener(APP_EVENTS.unauthorized, handleUnauthorized);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.auth.login(username, password);
    tokenStore.set(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // 登出接口失败也要清理本地登录态，避免用户被卡在页面内
    } finally {
      tokenStore.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
}

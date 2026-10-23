import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { ToastHost } from './components/ToastHost';
import { ConfigPage } from './pages/ConfigPage';
import { DashboardPage } from './pages/DashboardPage';
import { DeptPage } from './pages/DeptPage';
import { DictPage } from './pages/DictPage';
import { LoginLogPage } from './pages/LoginLogPage';
import { LoginPage } from './pages/LoginPage';
import { MenuPage } from './pages/MenuPage';
import { OrderPage } from './pages/OrderPage';
import { RolePage } from './pages/RolePage';
import { UserPage } from './pages/UserPage';

/** 登录守卫：加载登录态时显示占位，未登录跳转登录页并记住来源 */
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-loading">正在加载登录态…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastHost />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/system/users" element={<UserPage />} />
          <Route path="/system/roles" element={<RolePage />} />
          <Route path="/system/menus" element={<MenuPage />} />
          <Route path="/system/depts" element={<DeptPage />} />
          <Route path="/system/dict" element={<DictPage />} />
          <Route path="/system/configs" element={<ConfigPage />} />
          <Route path="/system/login-logs" element={<LoginLogPage />} />
          <Route path="/orders" element={<OrderPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

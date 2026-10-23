import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const NAV_GROUPS = [
  {
    label: '概览',
    items: [{ path: '/dashboard', name: '仪表盘' }],
  },
  {
    label: '系统管理',
    items: [
      { path: '/system/users', name: '用户管理' },
      { path: '/system/roles', name: '角色管理' },
      { path: '/system/menus', name: '菜单管理' },
      { path: '/system/depts', name: '部门管理' },
      { path: '/system/dict', name: '字典管理' },
      { path: '/system/configs', name: '参数配置' },
      { path: '/system/login-logs', name: '登录日志' },
    ],
  },
  {
    label: '业务示例',
    items: [{ path: '/orders', name: '订单示例' }],
  },
];

const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

/**
 * 后台整体布局：深色侧边栏 + 顶栏 + 内容区，移动端侧边栏可折叠。
 */
export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const title = NAV_ITEMS.find((item) => location.pathname.startsWith(item.path))?.name ?? '管理台';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'}>
        <div className="brand">
          <span className="brand-mark">CM</span>
          <span className="brand-text">
            <strong>company-mono</strong>
            <small>模块化单体底座</small>
          </span>
        </div>

        <nav className="nav">
          {NAV_GROUPS.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
                >
                  <span className="nav-dot" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">v1.0.0 · 单体会部署</div>
      </aside>

      {menuOpen ? <div className="sidebar-mask" onClick={() => setMenuOpen(false)} /> : null}

      <div className="app-main">
        <header className="topbar">
          <button type="button" className="menu-toggle" onClick={() => setMenuOpen((open) => !open)}>
            菜单
          </button>
          <div className="topbar-title">{title}</div>
          <div className="topbar-right">
            <span className="user-chip">
              <strong>{user?.nickName ?? user?.userName}</strong>
              <em>{user?.roles.length ? user.roles.join(' / ') : '无角色'}</em>
            </span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

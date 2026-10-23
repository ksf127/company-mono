import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * 登录页：账号密码登录，成功后回到来源页面。
 */
export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const from = (location.state as { from?: string } | null)?.from || '/dashboard';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('请输入账号和密码');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : '登录失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="brand brand-large">
          <span className="brand-mark">CM</span>
          <span className="brand-text">
            <strong>company-mono</strong>
            <small>模块化单体项目底座</small>
          </span>
        </div>
        <h1>一套可直接复用的企业后台底座</h1>
        <p>单仓库、单进程、单部署包，按业务模块组织代码，保持清晰的分层边界。</p>
        <ul className="login-features">
          <li>Spring Boot 3 + MyBatis-Plus + Flyway</li>
          <li>JWT 无状态鉴权与统一异常处理</li>
          <li>Actuator / Prometheus / OTLP 可观测性</li>
          <li>Vite + React + TypeScript 管理后台</li>
        </ul>
      </div>

      <div className="login-card">
        <h2>登录管理台</h2>
        <p className="login-subtitle">使用系统账号登录，默认管理员 admin / admin123</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="field">
            <span className="field-label">登录账号</span>
            <input
              className="input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入账号"
              autoComplete="username"
              autoFocus
            />
          </label>
          <label className="field">
            <span className="field-label">登录密码</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </label>
          {error ? <div className="form-error">{error}</div> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? '登录中…' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}

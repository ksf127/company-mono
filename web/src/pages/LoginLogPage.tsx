import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../api';
import { Pagination } from '../components/Pagination';
import type { SysLoginLog } from '../types';
import { formatTime } from '../utils/format';

const PAGE_SIZE = 10;

/**
 * 登录日志：只读列表，支持按账号搜索。
 */
export function LoginLogPage() {
  const [rows, setRows] = useState<SysLoginLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.loginLogs.page(page, PAGE_SIZE, submittedKeyword);
      setRows(result.rows);
      setTotal(result.total);
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setLoading(false);
    }
  }, [page, submittedKeyword]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSubmittedKeyword(keyword.trim());
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>登录日志</h1>
          <p>记录登录结果与客户端信息，便于排查异常登录。</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <form className="toolbar" onSubmit={handleSearch}>
            <input
              className="input toolbar-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索登录账号"
            />
            <button type="submit" className="btn btn-ghost">
              搜索
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setKeyword('');
                setSubmittedKeyword('');
                setPage(1);
              }}
            >
              重置
            </button>
          </form>
          <span className="panel-meta">{loading ? '加载中…' : `共 ${total} 条记录`}</span>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>登录账号</th>
                <th>IP 地址</th>
                <th>浏览器</th>
                <th>操作系统</th>
                <th>结果</th>
                <th>描述</th>
                <th>登录时间</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => (
                <tr key={log.infoId}>
                  <td className="mono">{log.infoId}</td>
                  <td>{log.userName}</td>
                  <td className="mono">{log.ipaddr || '-'}</td>
                  <td className="cell-ellipsis" title={log.browser || ''}>
                    {log.browser || '-'}
                  </td>
                  <td>{log.os || '-'}</td>
                  <td>
                    <span className={log.status === '0' ? 'badge badge-success' : 'badge badge-danger'}>
                      {log.status === '0' ? '成功' : '失败'}
                    </span>
                  </td>
                  <td className="text-muted">{log.msg || '-'}</td>
                  <td className="text-muted">{formatTime(log.loginTime)}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty">
                    暂无登录日志
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import type { BizOrder, SysLoginLog } from '../types';
import { formatAmount, formatTime } from '../utils/format';
import { orderStatusLabel, orderStatusTone } from '../utils/order';
import { countTree } from '../utils/tree';

interface DashboardData {
  userTotal: number;
  roleTotal: number;
  menuTotal: number;
  orderTotal: number;
  orders: BizOrder[];
  logs: SysLoginLog[];
}

const EMPTY_DATA: DashboardData = {
  userTotal: 0,
  roleTotal: 0,
  menuTotal: 0,
  orderTotal: 0,
  orders: [],
  logs: [],
};

/**
 * 仪表盘：汇总系统关键数据，并展示最近订单与登录记录。
 */
export function DashboardPage() {
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [users, roles, menus, orders, logs] = await Promise.all([
          api.users.page(1, 1),
          api.roles.list(),
          api.menus.tree(),
          api.orders.page(1, 5),
          api.loginLogs.page(1, 5),
        ]);
        if (!active) {
          return;
        }
        setData({
          userTotal: users.total,
          roleTotal: roles.length,
          menuTotal: countTree(menus, (node) => node.children),
          orderTotal: orders.total,
          orders: orders.rows,
          logs: logs.rows,
        });
      } catch {
        // 错误提示由请求层统一弹出
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { label: '用户总数', value: data.userTotal, hint: '系统账号数量', tone: 'blue' },
    { label: '角色数量', value: data.roleTotal, hint: '权限角色定义', tone: 'green' },
    { label: '菜单节点', value: data.menuTotal, hint: '目录与按钮合计', tone: 'purple' },
    { label: '订单总数', value: data.orderTotal, hint: '业务示例数据', tone: 'orange' },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>仪表盘</h1>
          <p>快速了解系统账号、权限与示例业务的整体情况。</p>
        </div>
        <div className="page-head-actions">
          <Link className="btn btn-ghost btn-sm" to="/system/users">
            管理用户
          </Link>
          <Link className="btn btn-primary btn-sm" to="/orders">
            新建订单
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div className={`stat-card stat-${stat.tone}`} key={stat.label}>
            <span className="stat-label">{stat.label}</span>
            <strong className="stat-value">{loading ? '—' : stat.value}</strong>
            <span className="stat-hint">{stat.hint}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>最近订单</h2>
              <p>最近创建的 5 条业务订单</p>
            </div>
            <Link className="text-link" to="/orders">
              查看全部
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>客户</th>
                  <th>金额</th>
                  <th>状态</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="mono">{order.orderNo}</td>
                    <td>{order.customerName}</td>
                    <td>￥{formatAmount(order.amount)}</td>
                    <td>
                      <span className={`badge badge-${orderStatusTone(order.status)}`}>
                        {orderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="text-muted">{formatTime(order.createTime)}</td>
                  </tr>
                ))}
                {!loading && data.orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty">
                      暂无订单数据
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>最近登录</h2>
              <p>最近 5 条登录日志</p>
            </div>
            <Link className="text-link" to="/system/login-logs">
              查看全部
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>账号</th>
                  <th>IP</th>
                  <th>结果</th>
                  <th>登录时间</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log.infoId}>
                    <td>{log.userName}</td>
                    <td className="mono">{log.ipaddr || '-'}</td>
                    <td>
                      <span className={log.status === '0' ? 'badge badge-success' : 'badge badge-danger'}>
                        {log.status === '0' ? '成功' : '失败'}
                      </span>
                    </td>
                    <td className="text-muted">{formatTime(log.loginTime)}</td>
                  </tr>
                ))}
                {!loading && logsEmpty(data.logs) ? (
                  <tr>
                    <td colSpan={4} className="empty">
                      暂无登录记录
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function logsEmpty(logs: SysLoginLog[]): boolean {
  return logs.length === 0;
}

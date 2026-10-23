import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, type OrderPayload } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import type { BizOrder } from '../types';
import { formatAmount, formatTime } from '../utils/format';
import { ORDER_STATUS, orderStatusLabel, orderStatusTone } from '../utils/order';
import { showToast } from '../utils/toast';

const PAGE_SIZE = 10;

interface OrderForm {
  customerName: string;
  amount: string;
  remark: string;
}

function emptyForm(): OrderForm {
  return { customerName: '', amount: '', remark: '' };
}

/**
 * 订单示例：演示业务模块的 CRUD、分页查询与状态流转。
 */
export function OrderPage() {
  const [rows, setRows] = useState<BizOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [submittedStatus, setSubmittedStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BizOrder | null>(null);
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.orders.page(page, PAGE_SIZE, submittedKeyword, submittedStatus);
      setRows(result.rows);
      setTotal(result.total);
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setLoading(false);
    }
  }, [page, submittedKeyword, submittedStatus]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSubmittedKeyword(keyword.trim());
    setSubmittedStatus(status);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (order: BizOrder) => {
    setEditing(order);
    setForm({
      customerName: order.customerName,
      amount: String(order.amount),
      remark: order.remark ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.customerName.trim()) {
      showToast('客户名称不能为空', 'error');
      return;
    }
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      showToast('订单金额必须大于 0', 'error');
      return;
    }
    const payload: OrderPayload = {
      customerName: form.customerName.trim(),
      amount,
      remark: form.remark || undefined,
    };
    setSaving(true);
    try {
      if (editing) {
        await api.orders.update(editing.orderId, payload);
        showToast('订单已更新');
      } else {
        await api.orders.create(payload);
        showToast('订单已创建');
      }
      closeModal();
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (order: BizOrder) => {
    if (!window.confirm(`确认删除订单「${order.orderNo}」吗？`)) {
      return;
    }
    try {
      await api.orders.remove(order.orderId);
      showToast('订单已删除');
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await load();
      }
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  const handleTransition = async (order: BizOrder, targetStatus: string) => {
    if (!window.confirm(`确认将订单「${order.orderNo}」变更为「${orderStatusLabel(targetStatus)}」吗？`)) {
      return;
    }
    try {
      await api.orders.updateStatus(order.orderId, targetStatus);
      showToast(`订单已变更为${orderStatusLabel(targetStatus)}`);
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>订单示例</h1>
          <p>演示业务模块的标准 CRUD 与状态流转：待支付 → 已支付 → 已发货 → 已完成。</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          新建订单
        </button>
      </div>

      <section className="panel">
        <div className="panel-head">
          <form className="toolbar" onSubmit={handleSearch}>
            <input
              className="input toolbar-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索订单号或客户名称"
            />
            <select className="select toolbar-select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">全部状态</option>
              {Object.entries(ORDER_STATUS).map(([value, item]) => (
                <option key={value} value={value}>
                  {item.label}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-ghost">
              搜索
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setKeyword('');
                setStatus('');
                setSubmittedKeyword('');
                setSubmittedStatus('');
                setPage(1);
              }}
            >
              重置
            </button>
          </form>
          <span className="panel-meta">{loading ? '加载中…' : `共 ${total} 笔订单`}</span>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>订单号</th>
                <th>客户名称</th>
                <th>金额</th>
                <th>状态</th>
                <th>备注</th>
                <th>创建时间</th>
                <th className="table-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((order) => (
                <tr key={order.orderId}>
                  <td className="mono">{order.orderNo}</td>
                  <td>{order.customerName}</td>
                  <td>￥{formatAmount(order.amount)}</td>
                  <td>
                    <span className={`badge badge-${orderStatusTone(order.status)}`}>
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="text-muted">{order.remark || '-'}</td>
                  <td className="text-muted">{formatTime(order.createTime)}</td>
                  <td className="table-actions">
                    {order.status === 'CREATED' ? (
                      <>
                        <button type="button" className="link-btn" onClick={() => openEdit(order)}>
                          编辑
                        </button>
                        <button type="button" className="link-btn" onClick={() => void handleTransition(order, 'PAID')}>
                          标记支付
                        </button>
                        <button
                          type="button"
                          className="link-btn link-danger"
                          onClick={() => void handleTransition(order, 'CANCELLED')}
                        >
                          取消
                        </button>
                      </>
                    ) : null}
                    {order.status === 'PAID' ? (
                      <button type="button" className="link-btn" onClick={() => void handleTransition(order, 'SHIPPED')}>
                        标记发货
                      </button>
                    ) : null}
                    {order.status === 'SHIPPED' ? (
                      <button type="button" className="link-btn" onClick={() => void handleTransition(order, 'COMPLETED')}>
                        完成订单
                      </button>
                    ) : null}
                    {order.status === 'CREATED' || order.status === 'CANCELLED' ? (
                      <button type="button" className="link-btn link-danger" onClick={() => void handleDelete(order)}>
                        删除
                      </button>
                    ) : null}
                    {order.status === 'COMPLETED' ? <span className="text-muted">已归档</span> : null}
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    没有匹配的订单
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </section>

      <Modal
        open={modalOpen}
        title={editing ? '编辑订单' : '新建订单'}
        onClose={closeModal}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={closeModal}>
              取消
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void handleSave()} disabled={saving}>
              {saving ? '保存中…' : '保存'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <Field label="客户名称" required>
            <input
              className="input"
              value={form.customerName}
              onChange={(event) => setForm({ ...form, customerName: event.target.value })}
              placeholder="例如 杭州某某科技有限公司"
            />
          </Field>
          <Field label="订单金额" required>
            <input
              className="input"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: event.target.value })}
              placeholder="0.00"
            />
          </Field>
          <Field label="备注" wide>
            <textarea
              className="textarea"
              rows={3}
              value={form.remark}
              onChange={(event) => setForm({ ...form, remark: event.target.value })}
              placeholder="可选"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, type ConfigPayload } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import type { SysConfig } from '../types';
import { formatTime } from '../utils/format';
import { showToast } from '../utils/toast';

const PAGE_SIZE = 10;

interface ConfigForm {
  configName: string;
  configValue: string;
  remark: string;
}

function emptyForm(): ConfigForm {
  return { configName: '', configValue: '', remark: '' };
}

/**
 * 参数配置：展示系统参数并支持修改参数值与备注。
 */
export function ConfigPage() {
  const [rows, setRows] = useState<SysConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SysConfig | null>(null);
  const [form, setForm] = useState<ConfigForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.configs.page(page, PAGE_SIZE, submittedKeyword);
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

  const openEdit = (config: SysConfig) => {
    setEditing(config);
    setForm({
      configName: config.configName,
      configValue: config.configValue,
      remark: config.remark ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!editing) {
      return;
    }
    if (!form.configName.trim() || !form.configValue.trim()) {
      showToast('参数名称与参数键值不能为空', 'error');
      return;
    }
    const payload: ConfigPayload = {
      configName: form.configName.trim(),
      configValue: form.configValue.trim(),
      remark: form.remark || undefined,
    };
    setSaving(true);
    try {
      await api.configs.update(editing.configId, payload);
      showToast('参数已更新');
      closeModal();
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>参数配置</h1>
          <p>维护运行期可调整的系统参数，键名由后端定义。</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <form className="toolbar" onSubmit={handleSearch}>
            <input
              className="input toolbar-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索参数名称或键名"
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
          <span className="panel-meta">{loading ? '加载中…' : `共 ${total} 项参数`}</span>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>参数名称</th>
                <th>参数键名</th>
                <th>参数键值</th>
                <th>备注</th>
                <th>创建时间</th>
                <th className="table-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((config) => (
                <tr key={config.configId}>
                  <td className="mono">{config.configId}</td>
                  <td>{config.configName}</td>
                  <td className="mono">{config.configKey}</td>
                  <td className="mono">{config.configValue}</td>
                  <td className="text-muted">{config.remark || '-'}</td>
                  <td className="text-muted">{formatTime(config.createTime)}</td>
                  <td className="table-actions">
                    <button type="button" className="link-btn" onClick={() => openEdit(config)}>
                      编辑
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    没有匹配的参数
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
        title="编辑参数"
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
          <Field label="参数名称" required>
            <input
              className="input"
              value={form.configName}
              onChange={(event) => setForm({ ...form, configName: event.target.value })}
            />
          </Field>
          <Field label="参数键名">
            <input className="input" value={editing?.configKey ?? ''} readOnly />
          </Field>
          <Field label="参数键值" required wide>
            <input
              className="input"
              value={form.configValue}
              onChange={(event) => setForm({ ...form, configValue: event.target.value })}
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

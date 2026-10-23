import { useCallback, useEffect, useState } from 'react';
import { api, type RolePayload } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import type { SysRole } from '../types';
import { showToast } from '../utils/toast';

interface RoleForm {
  roleName: string;
  roleKey: string;
  roleSort: string;
  status: string;
  remark: string;
}

function emptyForm(): RoleForm {
  return { roleName: '', roleKey: '', roleSort: '0', status: '0', remark: '' };
}

/**
 * 角色管理：列表、新增、编辑与删除。
 */
export function RolePage() {
  const [rows, setRows] = useState<SysRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SysRole | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await api.roles.list());
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (role: SysRole) => {
    setEditing(role);
    setForm({
      roleName: role.roleName,
      roleKey: role.roleKey,
      roleSort: String(role.roleSort),
      status: role.status,
      remark: role.remark ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.roleName.trim() || !form.roleKey.trim()) {
      showToast('角色名称与角色标识不能为空', 'error');
      return;
    }
    const payload: RolePayload = {
      roleName: form.roleName.trim(),
      roleKey: form.roleKey.trim(),
      roleSort: Number(form.roleSort) || 0,
      status: form.status,
      remark: form.remark || undefined,
    };
    setSaving(true);
    try {
      if (editing) {
        await api.roles.update(editing.roleId, payload);
        showToast('角色已更新');
      } else {
        await api.roles.create(payload);
        showToast('角色已创建');
      }
      closeModal();
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: SysRole) => {
    if (!window.confirm(`确认删除角色「${role.roleName}」吗？`)) {
      return;
    }
    try {
      await api.roles.remove(role.roleId);
      showToast('角色已删除');
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>角色管理</h1>
          <p>定义系统角色，用户通过角色获得权限标识。</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          新增角色
        </button>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>角色列表</h2>
            <p>内置管理员角色不可删除。</p>
          </div>
          <span className="panel-meta">{loading ? '加载中…' : `共 ${rows.length} 个角色`}</span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>角色名称</th>
                <th>角色标识</th>
                <th>排序</th>
                <th>状态</th>
                <th>备注</th>
                <th className="table-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((role) => (
                <tr key={role.roleId}>
                  <td className="mono">{role.roleId}</td>
                  <td>{role.roleName}</td>
                  <td className="mono">{role.roleKey}</td>
                  <td>{role.roleSort}</td>
                  <td>
                    <span className={role.status === '0' ? 'badge badge-success' : 'badge badge-danger'}>
                      {role.status === '0' ? '正常' : '停用'}
                    </span>
                  </td>
                  <td className="text-muted">{role.remark || '-'}</td>
                  <td className="table-actions">
                    <button type="button" className="link-btn" onClick={() => openEdit(role)}>
                      编辑
                    </button>
                    <button type="button" className="link-btn link-danger" onClick={() => void handleDelete(role)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    暂无角色数据
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={editing ? '编辑角色' : '新增角色'}
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
          <Field label="角色名称" required>
            <input
              className="input"
              value={form.roleName}
              onChange={(event) => setForm({ ...form, roleName: event.target.value })}
              placeholder="例如 运营人员"
            />
          </Field>
          <Field label="角色标识" required>
            <input
              className="input"
              value={form.roleKey}
              onChange={(event) => setForm({ ...form, roleKey: event.target.value })}
              placeholder="例如 operator"
            />
          </Field>
          <Field label="排序">
            <input
              className="input"
              type="number"
              value={form.roleSort}
              onChange={(event) => setForm({ ...form, roleSort: event.target.value })}
            />
          </Field>
          <Field label="状态">
            <select
              className="select"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              <option value="0">正常</option>
              <option value="1">停用</option>
            </select>
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

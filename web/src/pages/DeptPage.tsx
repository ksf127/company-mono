import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type DeptPayload } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import type { SysDept } from '../types';
import { showToast } from '../utils/toast';
import { countTree, flattenTree } from '../utils/tree';

interface DeptForm {
  deptName: string;
  parentId: string;
  orderNum: string;
  leader: string;
  phone: string;
  email: string;
  status: string;
}

function emptyForm(parentId = '0'): DeptForm {
  return {
    deptName: '',
    parentId,
    orderNum: '0',
    leader: '',
    phone: '',
    email: '',
    status: '0',
  };
}

function collectIds(dept: SysDept, result: Set<number> = new Set()): Set<number> {
  result.add(dept.deptId);
  dept.children.forEach((child) => collectIds(child, result));
  return result;
}

/**
 * 部门管理：树形组织架构维护。
 */
export function DeptPage() {
  const [tree, setTree] = useState<SysDept[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SysDept | null>(null);
  const [form, setForm] = useState<DeptForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTree(await api.depts.tree());
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flatDepts = useMemo(() => flattenTree(tree, (dept) => dept.children), [tree]);

  const parentOptions = useMemo(() => {
    if (!editing) {
      return flatDepts;
    }
    const excluded = collectIds(editing);
    return flatDepts.filter(({ node }) => !excluded.has(node.deptId));
  }, [flatDepts, editing]);

  const openCreate = (parentId = 0) => {
    setEditing(null);
    setForm(emptyForm(String(parentId)));
    setModalOpen(true);
  };

  const openEdit = (dept: SysDept) => {
    setEditing(dept);
    setForm({
      deptName: dept.deptName,
      parentId: String(dept.parentId ?? 0),
      orderNum: String(dept.orderNum ?? 0),
      leader: dept.leader ?? '',
      phone: dept.phone ?? '',
      email: dept.email ?? '',
      status: dept.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.deptName.trim()) {
      showToast('部门名称不能为空', 'error');
      return;
    }
    const payload: DeptPayload = {
      deptName: form.deptName.trim(),
      parentId: Number(form.parentId) || 0,
      orderNum: Number(form.orderNum) || 0,
      leader: form.leader || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      status: form.status,
    };
    setSaving(true);
    try {
      if (editing) {
        await api.depts.update(editing.deptId, payload);
        showToast('部门已更新');
      } else {
        await api.depts.create(payload);
        showToast('部门已创建');
      }
      closeModal();
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dept: SysDept) => {
    if (!window.confirm(`确认删除部门「${dept.deptName}」吗？`)) {
      return;
    }
    try {
      await api.depts.remove(dept.deptId);
      showToast('部门已删除');
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>部门管理</h1>
          <p>按树形结构维护组织架构与负责人信息。</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openCreate()}>
          新增部门
        </button>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>部门树</h2>
            <p>存在下级部门时需要先删除下级部门。</p>
          </div>
          <span className="panel-meta">
            {loading ? '加载中…' : `共 ${countTree(tree, (dept) => dept.children)} 个部门`}
          </span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>部门名称</th>
                <th>负责人</th>
                <th>联系电话</th>
                <th>邮箱</th>
                <th>排序</th>
                <th>状态</th>
                <th className="table-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {flatDepts.map(({ node, depth }) => (
                <tr key={node.deptId}>
                  <td>
                    <span className="tree-name" style={{ paddingLeft: `${depth * 20}px` }}>
                      {depth > 0 ? <span className="tree-branch">└</span> : null}
                      {node.deptName}
                    </span>
                  </td>
                  <td>{node.leader || '-'}</td>
                  <td>{node.phone || '-'}</td>
                  <td>{node.email || '-'}</td>
                  <td>{node.orderNum}</td>
                  <td>
                    <span className={node.status === '0' ? 'badge badge-success' : 'badge badge-danger'}>
                      {node.status === '0' ? '正常' : '停用'}
                    </span>
                  </td>
                  <td className="table-actions">
                    <button type="button" className="link-btn" onClick={() => openCreate(node.deptId)}>
                      新增下级
                    </button>
                    <button type="button" className="link-btn" onClick={() => openEdit(node)}>
                      编辑
                    </button>
                    <button type="button" className="link-btn link-danger" onClick={() => void handleDelete(node)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && flatDepts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    暂无部门数据
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={editing ? '编辑部门' : '新增部门'}
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
          <Field label="上级部门">
            <select
              className="select"
              value={form.parentId}
              onChange={(event) => setForm({ ...form, parentId: event.target.value })}
            >
              <option value="0">顶级部门</option>
              {parentOptions.map(({ node, depth }) => (
                <option key={node.deptId} value={node.deptId}>
                  {'· '.repeat(depth)}
                  {node.deptName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="部门名称" required>
            <input
              className="input"
              value={form.deptName}
              onChange={(event) => setForm({ ...form, deptName: event.target.value })}
              placeholder="例如 产品部"
            />
          </Field>
          <Field label="显示排序">
            <input
              className="input"
              type="number"
              value={form.orderNum}
              onChange={(event) => setForm({ ...form, orderNum: event.target.value })}
            />
          </Field>
          <Field label="负责人">
            <input
              className="input"
              value={form.leader}
              onChange={(event) => setForm({ ...form, leader: event.target.value })}
              placeholder="可选"
            />
          </Field>
          <Field label="联系电话">
            <input
              className="input"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="可选"
            />
          </Field>
          <Field label="邮箱">
            <input
              className="input"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="可选"
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
        </div>
      </Modal>
    </div>
  );
}

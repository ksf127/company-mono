import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type MenuPayload } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import type { SysMenu } from '../types';
import { showToast } from '../utils/toast';
import { countTree, flattenTree } from '../utils/tree';

const MENU_TYPES: Record<string, string> = {
  M: '目录',
  C: '菜单',
  F: '按钮',
};

interface MenuForm {
  menuName: string;
  parentId: string;
  orderNum: string;
  path: string;
  component: string;
  menuType: string;
  perms: string;
  icon: string;
  status: string;
}

function emptyForm(parentId = '0'): MenuForm {
  return {
    menuName: '',
    parentId,
    orderNum: '0',
    path: '',
    component: '',
    menuType: 'C',
    perms: '',
    icon: '',
    status: '0',
  };
}

function collectIds(menu: SysMenu, result: Set<number> = new Set()): Set<number> {
  result.add(menu.menuId);
  menu.children.forEach((child) => collectIds(child, result));
  return result;
}

/**
 * 菜单管理：树形展示目录、菜单和按钮，支持增删改。
 */
export function MenuPage() {
  const [tree, setTree] = useState<SysMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SysMenu | null>(null);
  const [form, setForm] = useState<MenuForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTree(await api.menus.tree());
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const flatMenus = useMemo(() => flattenTree(tree, (menu) => menu.children), [tree]);

  const parentOptions = useMemo(() => {
    if (!editing) {
      return flatMenus;
    }
    const excluded = collectIds(editing);
    return flatMenus.filter(({ node }) => !excluded.has(node.menuId));
  }, [flatMenus, editing]);

  const openCreate = (parentId = 0) => {
    setEditing(null);
    setForm(emptyForm(String(parentId)));
    setModalOpen(true);
  };

  const openEdit = (menu: SysMenu) => {
    setEditing(menu);
    setForm({
      menuName: menu.menuName,
      parentId: String(menu.parentId ?? 0),
      orderNum: String(menu.orderNum ?? 0),
      path: menu.path ?? '',
      component: menu.component ?? '',
      menuType: menu.menuType,
      perms: menu.perms ?? '',
      icon: menu.icon ?? '',
      status: menu.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.menuName.trim()) {
      showToast('菜单名称不能为空', 'error');
      return;
    }
    const payload: MenuPayload = {
      menuName: form.menuName.trim(),
      parentId: Number(form.parentId) || 0,
      orderNum: Number(form.orderNum) || 0,
      path: form.path || undefined,
      component: form.component || undefined,
      menuType: form.menuType,
      perms: form.perms || undefined,
      icon: form.icon || undefined,
      status: form.status,
    };
    setSaving(true);
    try {
      if (editing) {
        await api.menus.update(editing.menuId, payload);
        showToast('菜单已更新');
      } else {
        await api.menus.create(payload);
        showToast('菜单已创建');
      }
      closeModal();
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menu: SysMenu) => {
    if (!window.confirm(`确认删除菜单「${menu.menuName}」吗？`)) {
      return;
    }
    try {
      await api.menus.remove(menu.menuId);
      showToast('菜单已删除');
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>菜单管理</h1>
          <p>维护后台导航结构，目录、菜单与按钮按树形组织。</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openCreate()}>
          新增菜单
        </button>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>菜单树</h2>
            <p>包含子菜单的节点需要先删除子节点。</p>
          </div>
          <span className="panel-meta">
            {loading ? '加载中…' : `共 ${countTree(tree, (menu) => menu.children)} 个节点`}
          </span>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>菜单名称</th>
                <th>类型</th>
                <th>路由地址</th>
                <th>权限标识</th>
                <th>排序</th>
                <th>状态</th>
                <th className="table-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {flatMenus.map(({ node, depth }) => (
                <tr key={node.menuId}>
                  <td>
                    <span className="tree-name" style={{ paddingLeft: `${depth * 20}px` }}>
                      {depth > 0 ? <span className="tree-branch">└</span> : null}
                      {node.menuName}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${node.menuType === 'F' ? 'muted' : 'info'}`}>
                      {MENU_TYPES[node.menuType] ?? node.menuType}
                    </span>
                  </td>
                  <td className="mono">{node.path || '-'}</td>
                  <td className="mono">{node.perms || '-'}</td>
                  <td>{node.orderNum}</td>
                  <td>
                    <span className={node.status === '0' ? 'badge badge-success' : 'badge badge-danger'}>
                      {node.status === '0' ? '正常' : '停用'}
                    </span>
                  </td>
                  <td className="table-actions">
                    {node.menuType !== 'F' ? (
                      <button type="button" className="link-btn" onClick={() => openCreate(node.menuId)}>
                        新增下级
                      </button>
                    ) : null}
                    <button type="button" className="link-btn" onClick={() => openEdit(node)}>
                      编辑
                    </button>
                    <button type="button" className="link-btn link-danger" onClick={() => void handleDelete(node)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && flatMenus.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    暂无菜单数据
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={modalOpen}
        title={editing ? '编辑菜单' : '新增菜单'}
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
          <Field label="上级菜单">
            <select
              className="select"
              value={form.parentId}
              onChange={(event) => setForm({ ...form, parentId: event.target.value })}
            >
              <option value="0">顶级菜单</option>
              {parentOptions.map(({ node, depth }) => (
                <option key={node.menuId} value={node.menuId}>
                  {'· '.repeat(depth)}
                  {node.menuName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="菜单名称" required>
            <input
              className="input"
              value={form.menuName}
              onChange={(event) => setForm({ ...form, menuName: event.target.value })}
              placeholder="例如 报表中心"
            />
          </Field>
          <Field label="菜单类型">
            <select
              className="select"
              value={form.menuType}
              onChange={(event) => setForm({ ...form, menuType: event.target.value })}
            >
              <option value="M">目录</option>
              <option value="C">菜单</option>
              <option value="F">按钮</option>
            </select>
          </Field>
          <Field label="显示排序">
            <input
              className="input"
              type="number"
              value={form.orderNum}
              onChange={(event) => setForm({ ...form, orderNum: event.target.value })}
            />
          </Field>
          <Field label="路由地址">
            <input
              className="input"
              value={form.path}
              onChange={(event) => setForm({ ...form, path: event.target.value })}
              placeholder="/reports"
            />
          </Field>
          <Field label="组件路径">
            <input
              className="input"
              value={form.component}
              onChange={(event) => setForm({ ...form, component: event.target.value })}
              placeholder="可选"
            />
          </Field>
          <Field label="权限标识">
            <input
              className="input"
              value={form.perms}
              onChange={(event) => setForm({ ...form, perms: event.target.value })}
              placeholder="system:user:list"
            />
          </Field>
          <Field label="图标">
            <input
              className="input"
              value={form.icon}
              onChange={(event) => setForm({ ...form, icon: event.target.value })}
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

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { api, type UserPayload } from '../api';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import type { SysDept, SysRole, SysUser } from '../types';
import { formatTime } from '../utils/format';
import { showToast } from '../utils/toast';
import { flattenTree } from '../utils/tree';

const PAGE_SIZE = 10;

interface UserForm {
  userName: string;
  nickName: string;
  password: string;
  deptId: string;
  phonenumber: string;
  email: string;
  sex: string;
  status: string;
  remark: string;
  roleIds: number[];
}

function emptyForm(): UserForm {
  return {
    userName: '',
    nickName: '',
    password: '',
    deptId: '',
    phonenumber: '',
    email: '',
    sex: '2',
    status: '0',
    remark: '',
    roleIds: [],
  };
}

/**
 * 用户管理：关键字搜索、分页、增删改与角色分配。
 */
export function UserPage() {
  const [rows, setRows] = useState<SysUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<SysRole[]>([]);
  const [depts, setDepts] = useState<SysDept[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SysUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.users.page(page, PAGE_SIZE, submittedKeyword);
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

  useEffect(() => {
    Promise.all([api.roles.list(), api.depts.tree()])
      .then(([roleList, deptTree]) => {
        setRoles(roleList);
        setDepts(deptTree);
      })
      .catch(() => {
        // 错误提示由请求层统一弹出
      });
  }, []);

  const deptMap = useMemo(() => {
    const map = new Map<number, string>();
    flattenTree(depts, (dept) => dept.children).forEach(({ node }) => {
      map.set(node.deptId, node.deptName);
    });
    return map;
  }, [depts]);

  const deptOptions = useMemo(
    () => flattenTree(depts, (dept) => dept.children),
    [depts],
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSubmittedKeyword(keyword.trim());
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = async (user: SysUser) => {
    setEditing(user);
    setForm({
      userName: user.userName,
      nickName: user.nickName,
      password: '',
      deptId: user.deptId ? String(user.deptId) : '',
      phonenumber: user.phonenumber ?? '',
      email: user.email ?? '',
      sex: user.sex ?? '2',
      status: user.status,
      remark: user.remark ?? '',
      roleIds: [],
    });
    setModalOpen(true);
    try {
      const roleIds = await api.users.roleIds(user.userId);
      setForm((prev) => ({ ...prev, roleIds }));
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.userName.trim() || !form.nickName.trim()) {
      showToast('登录账号与用户昵称不能为空', 'error');
      return;
    }
    if (form.password && form.password.length < 6) {
      showToast('密码长度需为 6-64 位', 'error');
      return;
    }
    const payload: UserPayload = {
      userName: form.userName.trim(),
      nickName: form.nickName.trim(),
      password: form.password || undefined,
      deptId: form.deptId ? Number(form.deptId) : undefined,
      phonenumber: form.phonenumber || undefined,
      email: form.email || undefined,
      sex: form.sex,
      status: form.status,
      remark: form.remark || undefined,
      roleIds: form.roleIds,
    };
    setSaving(true);
    try {
      if (editing) {
        await api.users.update(editing.userId, payload);
        showToast('用户已更新');
      } else {
        await api.users.create(payload);
        showToast('用户已创建');
      }
      closeModal();
      await load();
    } catch {
      // 错误提示由请求层统一弹出
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: SysUser) => {
    if (!window.confirm(`确认删除用户「${user.nickName}」吗？`)) {
      return;
    }
    try {
      await api.users.remove(user.userId);
      showToast('用户已删除');
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        await load();
      }
    } catch {
      // 错误提示由请求层统一弹出
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>用户管理</h1>
          <p>维护登录账号、所属部门与角色权限。</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          新增用户
        </button>
      </div>

      <section className="panel">
        <div className="panel-head">
          <form className="toolbar" onSubmit={handleSearch}>
            <input
              className="input toolbar-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索账号、昵称或手机号"
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
          <span className="panel-meta">{loading ? '加载中…' : `共 ${total} 个用户`}</span>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>登录账号</th>
                <th>用户昵称</th>
                <th>部门</th>
                <th>手机号</th>
                <th>状态</th>
                <th>创建时间</th>
                <th className="table-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.userId}>
                  <td className="mono">{user.userId}</td>
                  <td>{user.userName}</td>
                  <td>{user.nickName}</td>
                  <td>{user.deptId ? deptMap.get(user.deptId) ?? '-' : '-'}</td>
                  <td>{user.phonenumber || '-'}</td>
                  <td>
                    <span className={user.status === '0' ? 'badge badge-success' : 'badge badge-danger'}>
                      {user.status === '0' ? '正常' : '停用'}
                    </span>
                  </td>
                  <td className="text-muted">{formatTime(user.createTime)}</td>
                  <td className="table-actions">
                    <button type="button" className="link-btn" onClick={() => void openEdit(user)}>
                      编辑
                    </button>
                    <button type="button" className="link-btn link-danger" onClick={() => void handleDelete(user)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty">
                    没有匹配的用户
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
        title={editing ? '编辑用户' : '新增用户'}
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
          <Field label="登录账号" required>
            <input
              className="input"
              value={form.userName}
              onChange={(event) => setForm({ ...form, userName: event.target.value })}
              placeholder="例如 zhangsan"
            />
          </Field>
          <Field label="用户昵称" required>
            <input
              className="input"
              value={form.nickName}
              onChange={(event) => setForm({ ...form, nickName: event.target.value })}
              placeholder="例如 张三"
            />
          </Field>
          <Field label="登录密码" hint={editing ? '留空表示不修改密码' : '留空则使用默认密码 123456'}>
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="6-64 位"
              autoComplete="new-password"
            />
          </Field>
          <Field label="所属部门">
            <select
              className="select"
              value={form.deptId}
              onChange={(event) => setForm({ ...form, deptId: event.target.value })}
            >
              <option value="">未分配</option>
              {deptOptions.map(({ node, depth }) => (
                <option key={node.deptId} value={node.deptId}>
                  {'· '.repeat(depth)}
                  {node.deptName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="手机号">
            <input
              className="input"
              value={form.phonenumber}
              onChange={(event) => setForm({ ...form, phonenumber: event.target.value })}
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
          <Field label="性别">
            <select
              className="select"
              value={form.sex}
              onChange={(event) => setForm({ ...form, sex: event.target.value })}
            >
              <option value="0">男</option>
              <option value="1">女</option>
              <option value="2">未知</option>
            </select>
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
          <Field label="角色" wide>
            <div className="checkbox-group">
              {roles.map((role) => (
                <label className="checkbox" key={role.roleId}>
                  <input
                    type="checkbox"
                    checked={form.roleIds.includes(role.roleId)}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        roleIds: event.target.checked
                          ? [...form.roleIds, role.roleId]
                          : form.roleIds.filter((id) => id !== role.roleId),
                      })
                    }
                  />
                  {role.roleName}
                </label>
              ))}
              {roles.length === 0 ? <span className="text-muted">暂无角色</span> : null}
            </div>
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

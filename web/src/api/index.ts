import type {
  BizOrder,
  LoginResponse,
  PageResult,
  SysConfig,
  SysDept,
  SysDictData,
  SysDictType,
  SysLoginLog,
  SysMenu,
  SysRole,
  SysUser,
  UserInfo,
} from '../types';
import { query, request } from './client';

export interface UserPayload {
  userName: string;
  nickName: string;
  password?: string;
  deptId?: number;
  phonenumber?: string;
  email?: string;
  sex: string;
  status: string;
  remark?: string;
  roleIds: number[];
}

export interface RolePayload {
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  remark?: string;
}

export interface MenuPayload {
  menuName: string;
  parentId: number;
  orderNum: number;
  path?: string;
  component?: string;
  menuType: string;
  perms?: string;
  icon?: string;
  status: string;
}

export interface DeptPayload {
  deptName: string;
  parentId: number;
  orderNum: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: string;
}

export interface DictTypePayload {
  dictName: string;
  dictType: string;
  status: string;
  remark?: string;
}

export interface DictDataPayload {
  dictType: string;
  dictLabel: string;
  dictValue: string;
  dictSort: number;
  listClass?: string;
  isDefault: string;
  status: string;
  remark?: string;
}

export interface ConfigPayload {
  configName: string;
  configValue: string;
  remark?: string;
}

export interface OrderPayload {
  customerName: string;
  amount: number;
  remark?: string;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

function remove<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      post<LoginResponse>('/api/auth/login', { username, password }),
    me: () => request<UserInfo>('/api/auth/me'),
    logout: () => post<void>('/api/auth/logout', {}),
  },
  users: {
    page: (pageNum: number, pageSize: number, keyword?: string) =>
      request<PageResult<SysUser>>(`/api/system/users/page${query({ pageNum, pageSize, keyword })}`),
    roleIds: (userId: number) => request<number[]>(`/api/system/users/${userId}/role-ids`),
    create: (body: UserPayload) => post<SysUser>('/api/system/users', body),
    update: (userId: number, body: UserPayload) => put<void>(`/api/system/users/${userId}`, body),
    remove: (userId: number) => remove<void>(`/api/system/users/${userId}`),
  },
  roles: {
    list: () => request<SysRole[]>('/api/system/roles'),
    create: (body: RolePayload) => post<SysRole>('/api/system/roles', body),
    update: (roleId: number, body: RolePayload) => put<void>(`/api/system/roles/${roleId}`, body),
    remove: (roleId: number) => remove<void>(`/api/system/roles/${roleId}`),
  },
  menus: {
    tree: () => request<SysMenu[]>('/api/system/menus/tree'),
    create: (body: MenuPayload) => post<SysMenu>('/api/system/menus', body),
    update: (menuId: number, body: MenuPayload) => put<void>(`/api/system/menus/${menuId}`, body),
    remove: (menuId: number) => remove<void>(`/api/system/menus/${menuId}`),
  },
  depts: {
    tree: () => request<SysDept[]>('/api/system/depts/tree'),
    create: (body: DeptPayload) => post<SysDept>('/api/system/depts', body),
    update: (deptId: number, body: DeptPayload) => put<void>(`/api/system/depts/${deptId}`, body),
    remove: (deptId: number) => remove<void>(`/api/system/depts/${deptId}`),
  },
  dict: {
    types: () => request<SysDictType[]>('/api/system/dict/types'),
    typePage: (pageNum: number, pageSize: number, keyword?: string) =>
      request<PageResult<SysDictType>>(`/api/system/dict/types/page${query({ pageNum, pageSize, keyword })}`),
    createType: (body: DictTypePayload) => post<SysDictType>('/api/system/dict/types', body),
    updateType: (dictId: number, body: DictTypePayload) => put<void>(`/api/system/dict/types/${dictId}`, body),
    removeType: (dictId: number) => remove<void>(`/api/system/dict/types/${dictId}`),
    data: (dictType: string) => request<SysDictData[]>(`/api/system/dict/data${query({ dictType })}`),
    createData: (body: DictDataPayload) => post<SysDictData>('/api/system/dict/data', body),
    updateData: (dictCode: number, body: DictDataPayload) =>
      put<void>(`/api/system/dict/data/${dictCode}`, body),
    removeData: (dictCode: number) => remove<void>(`/api/system/dict/data/${dictCode}`),
  },
  configs: {
    page: (pageNum: number, pageSize: number, keyword?: string) =>
      request<PageResult<SysConfig>>(`/api/system/configs/page${query({ pageNum, pageSize, keyword })}`),
    update: (configId: number, body: ConfigPayload) =>
      put<void>(`/api/system/configs/${configId}`, body),
  },
  loginLogs: {
    page: (pageNum: number, pageSize: number, keyword?: string) =>
      request<PageResult<SysLoginLog>>(`/api/system/login-logs/page${query({ pageNum, pageSize, keyword })}`),
  },
  orders: {
    page: (pageNum: number, pageSize: number, keyword?: string, status?: string) =>
      request<PageResult<BizOrder>>(`/api/orders/page${query({ pageNum, pageSize, keyword, status })}`),
    create: (body: OrderPayload) => post<BizOrder>('/api/orders', body),
    update: (orderId: number, body: OrderPayload) => put<void>(`/api/orders/${orderId}`, body),
    remove: (orderId: number) => remove<void>(`/api/orders/${orderId}`),
    updateStatus: (orderId: number, status: string) =>
      post<BizOrder>(`/api/orders/${orderId}/status`, { status }),
  },
};

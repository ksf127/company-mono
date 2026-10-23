/** 分页返回结构，与后端 PageResult 对应 */
export interface PageResult<T> {
  total: number;
  rows: T[];
}

/** 登录用户信息 */
export interface UserInfo {
  userId: number;
  userName: string;
  nickName: string;
  deptId?: number;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface SysUser {
  userId: number;
  userName: string;
  nickName: string;
  deptId?: number;
  phonenumber?: string;
  email?: string;
  sex?: string;
  status: string;
  remark?: string;
  createTime?: string;
}

export interface SysRole {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  remark?: string;
  createTime?: string;
}

export interface SysMenu {
  menuId: number;
  menuName: string;
  parentId: number;
  orderNum: number;
  path?: string;
  component?: string;
  menuType: string;
  perms?: string;
  icon?: string;
  status: string;
  createTime?: string;
  children: SysMenu[];
}

export interface SysDept {
  deptId: number;
  parentId: number;
  deptName: string;
  orderNum: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: string;
  createTime?: string;
  children: SysDept[];
}

export interface SysDictType {
  dictId: number;
  dictName: string;
  dictType: string;
  status: string;
  remark?: string;
  createTime?: string;
}

export interface SysDictData {
  dictCode: number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  listClass?: string;
  isDefault: string;
  status: string;
  remark?: string;
  createTime?: string;
}

export interface SysConfig {
  configId: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType: string;
  remark?: string;
  createTime?: string;
}

export interface SysLoginLog {
  infoId: number;
  userName: string;
  ipaddr?: string;
  browser?: string;
  os?: string;
  status: string;
  msg?: string;
  loginTime?: string;
}

export interface BizOrder {
  orderId: number;
  orderNo: string;
  customerName: string;
  amount: number;
  status: string;
  remark?: string;
  createTime?: string;
}

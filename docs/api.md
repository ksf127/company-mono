# 接口文档

## 通用约定

- 基础路径：`/api`
- 请求体与响应体均为 JSON（`Content-Type: application/json`）
- 除 `POST /api/auth/login` 外，所有 `/api` 接口都需要请求头：

```http
Authorization: Bearer <token>
```

### 统一响应

```json
{
  "code": 0,
  "message": "OK",
  "data": {}
}
```

- `code = 0` 表示成功；
- 业务失败返回 **HTTP 200**，`code != 0`，`message` 为可展示的中文提示；
- 鉴权失败（token 缺失、无效、过期、已登出）由过滤器直接返回 **HTTP 401**，响应体同样是上面的结构。

### 错误码

| code | 含义 |
| --- | --- |
| 0 | 成功 |
| 400 | 参数不合法 |
| 401 | 未认证或登录已过期 |
| 403 | 无权限（例如账号停用） |
| 404 | 资源不存在 |
| 409 | 资源状态冲突 |
| 500 | 系统繁忙 |

### 分页响应

```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "total": 25,
    "rows": []
  }
}
```

分页参数：`pageNum` 默认 1，`pageSize` 默认 10（服务端限制在 1-100）。

---

## 认证

### POST /api/auth/login

请求：

```json
{ "username": "admin", "password": "admin123" }
```

响应 `data`：

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 7200,
  "user": {
    "userId": 1,
    "userName": "admin",
    "nickName": "超级管理员",
    "deptId": 100,
    "roles": ["admin"]
  }
}
```

失败：

- 用户名或密码错误：`code=401`
- 账号停用：`code=403`

登录成功与失败都会写入登录日志。

### GET /api/auth/me

返回当前登录用户，结构同登录响应中的 `user`。

### POST /api/auth/logout

将当前 token 加入黑名单，无请求体。再次使用该 token 会收到 HTTP 401。

---

## 用户管理

基础路径：`/api/system/users`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/page?pageNum=1&pageSize=10&keyword=` | 分页查询，`keyword` 匹配账号或昵称 |
| GET | `/{userId}` | 查询单个用户（不返回密码） |
| GET | `/{userId}/role-ids` | 查询用户已分配的角色 ID 列表 |
| POST | `/` | 新增用户 |
| PUT | `/{userId}` | 修改用户 |
| DELETE | `/{userId}` | 逻辑删除用户 |

新增/修改请求体：

```json
{
  "userName": "zhangsan",
  "nickName": "张三",
  "password": "123456",
  "deptId": 101,
  "phonenumber": "13900000000",
  "email": "zhangsan@company.com",
  "sex": "0",
  "status": "0",
  "remark": "研发部成员",
  "roleIds": [2]
}
```

字段说明：

- `userName`、`nickName` 必填；
- `password` 留空表示不修改，非空时长度 6-64；
- `sex`：`0` 男、`1` 女、`2` 未知；
- `status`：`0` 正常、`1` 停用；
- `roleIds` 会整体覆盖用户已有角色。

---

## 角色管理

基础路径：`/api/system/roles`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/` | 查询全部角色 |
| POST | `/` | 新增角色 |
| PUT | `/{roleId}` | 修改角色 |
| DELETE | `/{roleId}` | 逻辑删除角色 |

请求体：

```json
{
  "roleName": "运营",
  "roleKey": "operator",
  "roleSort": 3,
  "status": "0",
  "remark": "运营角色"
}
```

`roleName`、`roleKey` 必填且唯一。

---

## 菜单管理

基础路径：`/api/system/menus`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/tree` | 返回菜单树（`children` 嵌套） |
| POST | `/` | 新增菜单 |
| PUT | `/{menuId}` | 修改菜单 |
| DELETE | `/{menuId}` | 逻辑删除菜单 |

请求体：

```json
{
  "menuName": "报表管理",
  "parentId": 2,
  "orderNum": 8,
  "path": "/system/reports",
  "component": "ReportPage",
  "menuType": "C",
  "perms": "system:report:list",
  "icon": "chart",
  "status": "0"
}
```

`menuType`：`M` 目录、`C` 菜单、`F` 按钮。`parentId=0` 表示根节点。

---

## 部门管理

基础路径：`/api/system/depts`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/tree` | 返回部门树（`children` 嵌套） |
| POST | `/` | 新增部门 |
| PUT | `/{deptId}` | 修改部门 |
| DELETE | `/{deptId}` | 逻辑删除部门 |

请求体：

```json
{
  "deptName": "测试部",
  "parentId": 100,
  "orderNum": 3,
  "leader": "李四",
  "phone": "13700000000",
  "email": "qa@company.com",
  "status": "0"
}
```

---

## 字典管理

基础路径：`/api/system/dict`

### 字典类型

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/types` | 全部启用中的字典类型 |
| GET | `/types/page?pageNum=1&pageSize=10&keyword=` | 字典类型分页 |
| POST | `/types` | 新增类型 |
| PUT | `/types/{dictId}` | 修改类型 |
| DELETE | `/types/{dictId}` | 逻辑删除类型 |

请求体：

```json
{
  "dictName": "订单状态",
  "dictType": "biz_order_status",
  "status": "0",
  "remark": "订单状态列表"
}
```

### 字典数据

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/data?dictType=biz_order_status` | 按类型查询字典数据 |
| POST | `/data` | 新增数据 |
| PUT | `/data/{dictCode}` | 修改数据 |
| DELETE | `/data/{dictCode}` | 逻辑删除数据 |

请求体：

```json
{
  "dictType": "biz_order_status",
  "dictLabel": "待支付",
  "dictValue": "CREATED",
  "dictSort": 1,
  "listClass": "warning",
  "isDefault": "0",
  "status": "0",
  "remark": ""
}
```

`isDefault`：`0` 否、`1` 是。

---

## 参数配置

基础路径：`/api/system/configs`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/page?pageNum=1&pageSize=10&keyword=` | 分页查询，`keyword` 匹配名称或键名 |
| PUT | `/{configId}` | 更新参数 |

请求体：

```json
{
  "configName": "系统名称",
  "configValue": "company-mono",
  "remark": "页面标题"
}
```

参数键名不可修改。

---

## 登录日志

基础路径：`/api/system/login-logs`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/page?pageNum=1&pageSize=10&keyword=` | 分页查询，`keyword` 匹配账号 |

返回字段：`infoId`、`userName`、`ipaddr`、`browser`、`os`、`status`（`0` 成功 / `1` 失败）、`msg`、`loginTime`。

---

## 订单示例

基础路径：`/api/orders`

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/page?pageNum=1&pageSize=10&keyword=&status=` | 分页查询，`keyword` 匹配订单号或客户名称 |
| GET | `/{orderId}` | 查询单个订单 |
| POST | `/` | 创建订单 |
| PUT | `/{orderId}` | 修改订单（仅 `CREATED`） |
| DELETE | `/{orderId}` | 删除订单（仅 `CREATED` / `CANCELLED`） |
| POST | `/{orderId}/status` | 状态流转 |

创建/修改请求体：

```json
{
  "customerName": "示例客户",
  "amount": 199.00,
  "remark": "加急"
}
```

状态流转请求体：

```json
{ "status": "PAID" }
```

状态机：

```text
CREATED ──> PAID ──> SHIPPED ──> COMPLETED
   └──────> CANCELLED
```

- `COMPLETED`、`CANCELLED` 为终态；
- 非法流转返回 `code=409`；
- 订单号由服务端生成，格式 `SO + yyyyMMddHHmmssSSS + 3 位随机数`。

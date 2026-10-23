# 架构说明

## 设计目标

- **一个进程、一个 jar、一个数据库**：避免过早引入注册中心、网关、服务间调用等分布式复杂度。
- **按业务模块分包**：`auth`、`system`、`order` 各自拥有 controller / service / mapper / entity / dto，模块边界清晰。
- **公共能力下沉**：`common` 只提供与业务无关的响应模型、异常、JWT、上下文与基础配置。
- **可演进**：模块之间通过 service 接口或领域对象交互；后续拆分微服务时，可按包迁移，不必先重构分层。

## 模块划分

```text
com.company.mono
├── CompanyMonoApplication   启动类（@MapperScan 显式声明 mapper 包）
├── common
│   ├── api          ApiResult、PageResult
│   ├── config       MybatisPlusConfig、WebConfig
│   ├── exception    ErrorCode、BizException、GlobalExceptionHandler
│   └── security     JwtProperties、JwtService、TokenBlacklist、JwtAuthFilter、UserContext
├── auth             登录、当前用户、登出、登录日志写入
├── system           用户、角色、菜单、部门、字典、参数、登录日志
└── order            订单示例（CRUD + 状态机）
```

## 分层规则

```text
Controller -> Service -> Mapper -> MySQL
                 |
              Entity / DTO
```

- Controller 只负责参数接收、校验与响应封装，**不直接依赖 Mapper**。
- Service 负责业务规则、事务与多表编排。
- Mapper 只做数据访问，复杂 SQL 使用 MyBatis-Plus Wrapper 或注解 SQL。
- DTO 使用 Java `record` + Jakarta Validation，实体不直接暴露密码等敏感字段。

分层由 `src/test/java/com/company/mono/ArchitectureTest.java` 中的 ArchUnit 规则强制校验：

1. controller 只能依赖同模块（及 common）的 service，不能依赖 mapper；
2. service 才能依赖 mapper；
3. 禁止 controller 直接依赖 mapper。

## 请求处理链路

```text
HTTP 请求
  └─ JwtAuthFilter（/api 下除登录外均校验 Bearer Token）
       ├─ token 无效/已登出 -> 直接返回 HTTP 401 + 统一 JSON
       └─ 校验通过 -> UserContext 写入 userId/userName
            └─ Controller -> Service -> Mapper
                 └─ GlobalExceptionHandler 统一处理异常
                      └─ ApiResult 响应
```

- `UserContext` 基于 `ThreadLocal`，在 `finally` 中清理，避免线程复用导致串号。
- 过滤器顺序由 `WebConfig` 中的 `FilterRegistrationBean` 固定为 10。
- CORS 在 `WebConfig` 中统一配置，允许携带 `Authorization` 头。

## 认证与登出

1. `POST /api/auth/login` 校验账号密码（BCrypt）与账号状态；
2. 校验通过后用 JJWT 签发 token，`jti` 唯一，`sub` 为用户 ID；
3. 后续请求由 `JwtAuthFilter` 解析并校验签名、过期时间与黑名单；
4. `POST /api/auth/logout` 把当前 token 的 `jti` 写入 `TokenBlacklist`，直至自然过期。

> `TokenBlacklist` 当前使用 `ConcurrentHashMap` 存储，仅适用于单实例。生产多实例部署时应替换为 Redis，并保留相同的 `revoke/isRevoked` 语义。

登录成功与失败都会写入 `sys_login_log`；写日志失败只记录告警，不影响登录结果。

## 统一响应与错误处理

成功响应：

```json
{ "code": 0, "message": "OK", "data": { } }
```

业务异常（`BizException`）由 `GlobalExceptionHandler` 捕获，返回 **HTTP 200**，通过 `code` 表达业务结果；参数校验失败返回 `code=400`。

唯一例外是 `JwtAuthFilter` 的鉴权失败：它直接返回 **HTTP 401**，让前端能区分“登录态失效”和“业务失败”。

错误码定义在 `ErrorCode`：

| code | 含义 |
| --- | --- |
| 0 | 成功 |
| 400 | 参数不合法 |
| 401 | 未认证或登录已过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源状态冲突 |
| 500 | 系统繁忙 |

业务模块扩展错误码时从 `10000` 起分段。

## 数据模型

Flyway `V1__init.sql` 创建 11 张表：

| 表 | 说明 |
| --- | --- |
| `sys_user` | 用户 |
| `sys_role` | 角色 |
| `sys_user_role` | 用户角色关联 |
| `sys_menu` | 菜单/权限 |
| `sys_role_menu` | 角色菜单关联 |
| `sys_dept` | 部门 |
| `sys_dict_type` | 字典类型 |
| `sys_dict_data` | 字典数据 |
| `sys_config` | 参数配置 |
| `sys_login_log` | 登录日志 |
| `biz_order` | 订单示例 |

约定：

- 业务表使用 `deleted` 逻辑删除（0 正常 / 1 删除），由 MyBatis-Plus `logic-delete-field` 与 `@TableLogic` 处理；
- `create_time` / `update_time` 由数据库默认值与 `ON UPDATE` 维护；
- 分页统一使用 MyBatis-Plus `PaginationInnerInterceptor`（MySQL 方言），`pageSize` 上限 100；
- 所有建表语句使用 `CREATE TABLE IF NOT EXISTS`，种子数据使用 `INSERT IGNORE`，可重复执行。

## 前端架构

```text
web/src
├── api/client.ts      fetch 封装：token、401、统一错误、事件
├── api/index.ts       按模块聚合的接口定义
├── auth/AuthContext   登录态、启动校验、401 联动
├── components         Layout、Modal、Pagination、Field、ToastHost
├── pages              登录、仪表盘与各管理页面
├── utils              树、格式化、订单状态、Toast
├── App.tsx            路由与登录守卫
└── styles.css         设计令牌与全部样式（纯 CSS）
```

- 不使用任何 UI 组件库，样式集中在 `styles.css`，通过 CSS 变量维护主题。
- `request` 自动附加 `Authorization: Bearer <token>`；
- 收到 HTTP 401 时清除本地 token 并广播 `unauthorized` 事件，`AuthProvider` 清理用户，路由守卫跳转登录页；
- 业务错误（HTTP 200 且 `code != 0`）广播 `error` 事件，由 `ToastHost` 统一提示；
- 登录接口失败只在登录表单内展示，不弹全局提示。

## 可观测性

- `/actuator/health`、`/actuator/info`、`/actuator/prometheus` 对外暴露；
- 指标附带 `application=company-mono` 标签；
- 通过 Micrometer Tracing + OTLP 导出链路，端点由环境变量配置；
- `application-prod.yml` 关闭 SQL 控制台日志，并禁止 Flyway `clean`。

## 扩展新业务模块

以新增 `billing` 模块为例：

1. 新建 `com.company.mono.billing`，按 `controller/service/mapper/entity/dto` 建包；
2. 若新增 mapper 包，在 `CompanyMonoApplication` 的 `@MapperScan` 中追加该包（不支持通配符）；
3. 新增 Flyway 脚本 `V2__billing.sql`，不要修改已执行的 `V1`；
4. 复用 `ApiResult`、`PageResult`、`BizException`，不要另造响应结构；
5. 补充 Mockito 单测，并保持 ArchUnit 分层规则通过；
6. 前端在 `api/index.ts` 增加接口定义，新增页面并注册路由。

# 开发指南

## 环境要求

| 工具 | 版本 |
| --- | --- |
| JDK | 17 及以上（工程以 release 17 编译） |
| Maven | 3.8+ |
| Node.js | 20+（推荐 22，与 CI 一致） |
| MySQL | 8.0+ |

## 本地启动

### 数据库

```sql
CREATE DATABASE IF NOT EXISTS company_mono
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'app'@'%' IDENTIFIED BY 'app';
GRANT ALL PRIVILEGES ON company_mono.* TO 'app'@'%';
FLUSH PRIVILEGES;
```

应用启动时 Flyway 会自动执行 `src/main/resources/db/migration/V1__init.sql`，创建 11 张表并写入种子数据。

如果希望用 Docker 只启动 MySQL：

```bash
docker compose up -d mysql
```

### 后端

```bash
mvn spring-boot:run
```

- 端口：`8080`
- 健康检查：`GET http://localhost:8080/actuator/health`
- 指标：`GET http://localhost:8080/actuator/prometheus`

如需连接其他数据库，通过环境变量覆盖：

```bash
DB_URL="jdbc:mysql://127.0.0.1:3306/company_mono?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false" \
DB_USERNAME=app \
DB_PASSWORD=app \
mvn spring-boot:run
```

Windows PowerShell 可使用：

```powershell
$env:DB_URL="jdbc:mysql://127.0.0.1:3306/company_mono?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false"
$env:DB_USERNAME="app"
$env:DB_PASSWORD="app"
mvn spring-boot:run
```

### 前端

```bash
cd web
npm install
npm run dev
```

- 开发地址：`http://localhost:5173`
- `/api` 由 Vite 代理到 `http://localhost:8080`
- 生产构建：`npm run build`，产物在 `web/dist`

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `mvn -B -ntp test` | 运行全部测试（ArchUnit + Mockito，不依赖 MySQL） |
| `mvn -B -ntp -DskipTests package` | 打包可执行 jar |
| `mvn -B -ntp verify` | CI 使用的完整验证 |
| `npm run lint` | ESLint 9 flat config |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run build` | 类型检查 + Vite 生产构建 |

## 测试约定

- **单元测试不启动 Spring 容器、不连接数据库**：Service 通过 Mockito 模拟 Mapper。
- `AuthServiceTest` 覆盖：登录成功、密码错误、账号停用。
- `BizOrderServiceTest` 覆盖：创建订单、合法状态流转、非法状态流转。
- `ArchitectureTest` 使用 ArchUnit 固化分层：
  - controller 只能依赖 service；
  - service 才能依赖 mapper；
  - 禁止 controller 直接依赖 mapper。

新增模块时必须保证以上规则通过；若确实需要跨层调用，应调整设计而不是放宽规则。

## 代码约定

- 包名统一 `com.company.mono.<模块>`；
- 注释使用中文，公共类与关键业务规则需要说明“为什么”；
- 对外响应只使用 `ApiResult` / `PageResult`，不返回裸对象；
- 业务失败抛 `BizException`，不要在各层自行拼装错误响应；
- 实体字段与数据库列使用驼峰/下划线自动映射；
- 逻辑删除统一使用 `deleted` 字段；
- 分页统一通过 MyBatis-Plus `Page` + `PaginationInnerInterceptor`；
- 时间字段使用 `LocalDateTime`；
- 密码只允许写入，实体上使用 `@JsonIgnore` 防止泄露。

## 新增业务模块

1. 在 `com.company.mono` 下创建模块包，按 `controller/service/mapper/entity/dto` 分层；
2. 在 `CompanyMonoApplication` 的 `@MapperScan` 中追加新的 mapper 包（注解不支持 `**` 通配符）；
3. 新增 Flyway 迁移脚本，例如 `V2__billing.sql`；**不要修改已发布的迁移脚本**；
4. 编写 Service 单元测试，确保不依赖数据库；
5. 前端在 `web/src/api/index.ts` 增加接口定义，在 `web/src/pages` 增加页面并在 `App.tsx` 注册路由；
6. 需要新菜单时，更新种子脚本或通过菜单管理页面维护。

## 前端约定

- 所有请求走 `web/src/api/client.ts` 的 `request`，自动附带 token 并统一处理错误；
- 401 会清除本地 token 并触发跳转登录，业务错误由 `ToastHost` 统一提示；
- 页面状态（分页、搜索关键字、弹窗开关）保持组件内局部状态，不引入全局状态库；
- 样式统一写在 `styles.css`，复用已有 CSS 变量与类名，不引入 UI 组件库；
- 所有面向用户的文案使用中文。

## 数据库迁移

- 迁移脚本位于 `src/main/resources/db/migration`；
- 命名规则 `V{版本}__{说明}.sql`，版本号递增；
- 已执行过的脚本禁止修改，否则 Flyway 校验失败；
- 生产环境 `application-prod.yml` 已设置 `clean-disabled: true`；
- 新增脚本后运行一次应用或 `mvn spring-boot:run` 即可自动迁移。

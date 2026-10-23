# company-mono

一个可直接运行的**模块化单体**（Modular Monolith）项目底座：单个 Maven 模块、单个可部署 jar，按业务模块分包，前端为独立的 Vite + React 管理后台。适合作为中小型后台系统的起点，后续如需拆分服务，可按业务包平滑迁移。

## 技术栈

| 层次 | 选型 |
| --- | --- |
| 运行时 | Java 17 |
| 后端框架 | Spring Boot 3.2.5 |
| 数据访问 | MyBatis-Plus 3.5.6 + MySQL 8 |
| 数据库迁移 | Flyway |
| 认证 | JJWT 0.12.5 + BCrypt，JWT 无状态认证 |
| 可观测性 | Actuator + Prometheus + Micrometer Tracing + OTLP |
| 前端 | Vite 7 + React 19 + TypeScript（纯 CSS，不依赖 UI 组件库） |
| 测试 | JUnit 5 + Mockito + ArchUnit |
| 部署 | Docker 多阶段构建 + Docker Compose + Nginx |

## 功能概览

- 登录 / 当前用户 / 登出（登出使用内存 token 黑名单）
- 用户管理：分页、关键字搜索、新增、编辑、删除、角色分配
- 角色管理：列表与增删改
- 菜单管理：树形结构
- 部门管理：树形结构
- 字典管理：字典类型 + 字典数据联动
- 参数配置：分页查询与更新
- 登录日志：分页查询（登录成功与失败都会记录）
- 订单示例：CRUD、分页、关键字/状态筛选、受控状态流转
- 仪表盘：用户/角色/菜单/订单/日志统计与最近数据

## 目录结构

```text
company-mono/
├── pom.xml                      # 单模块 Maven 工程
├── src/main/java/com/company/mono/
│   ├── CompanyMonoApplication.java
│   ├── common/                  # 通用能力：响应、异常、JWT、上下文、配置
│   ├── auth/                    # 认证模块
│   ├── system/                  # 系统管理模块（用户/角色/菜单/部门/字典/参数/日志）
│   └── order/                   # 订单示例模块
├── src/main/resources/
│   ├── application.yml
│   ├── application-prod.yml
│   └── db/migration/V1__init.sql
├── src/test/java/               # ArchUnit 分层测试 + Mockito 单测
├── web/                         # Vite + React 前端
├── deploy/db/init/              # 容器首次启动建库脚本
├── docs/                        # 架构、接口、开发、部署文档
├── Dockerfile                   # 后端多阶段构建
├── docker-compose.yml           # mysql + backend + web
└── .github/workflows/ci.yml     # CI
```

## 快速开始

### 1. 准备数据库

创建数据库（默认库名 `company_mono`，账号 `app/app`）：

```sql
CREATE DATABASE IF NOT EXISTS company_mono
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
```

表结构与种子数据由 Flyway 在应用启动时自动执行 `V1__init.sql`。

### 2. 启动后端

```bash
mvn spring-boot:run
```

后端监听 `http://localhost:8080`，健康检查：`http://localhost:8080/actuator/health`。

### 3. 启动前端

```bash
cd web
npm install
npm run dev
```

访问 `http://localhost:5173`，开发服务器会把 `/api` 代理到 `http://localhost:8080`。

### 4. 默认账号

| 账号 | 密码 | 说明 |
| --- | --- | --- |
| `admin` | `admin123` | 内置管理员，首次登录后请修改密码 |

### 5. Docker 一键启动

```bash
docker compose up -d --build
```

- 前端：http://localhost
- 后端：http://localhost:8080
- MySQL：localhost:3306（默认 `app/app`，root 密码可用 `MYSQL_ROOT_PASSWORD` 覆盖）

## 验证命令

```bash
# 后端测试（ArchUnit + Mockito，不依赖 MySQL）
mvn -B -ntp test

# 后端打包
mvn -B -ntp -DskipTests package

# 前端校验与构建
cd web
npm install
npm run lint
npm run typecheck
npm run build
```

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://127.0.0.1:3306/company_mono?...` | 数据库连接串 |
| `DB_USERNAME` | `app` | 数据库账号 |
| `DB_PASSWORD` | `app` | 数据库密码 |
| `JWT_SECRET` | 开发用默认值 | JWT 签名密钥，生产必须覆盖 |
| `JWT_EXPIRE_MINUTES` | `120` | token 有效期（分钟） |
| `JWT_ISSUER` | `company-mono` | token 签发者 |
| `TRACING_SAMPLE_RATE` | `1.0` | 链路采样率 |
| `OTLP_TRACES_ENDPOINT` | `http://localhost:4318/v1/traces` | OTLP 链路地址 |
| `OTLP_METRICS_ENDPOINT` | `http://localhost:4318/v1/metrics` | OTLP 指标地址 |
| `SPRING_PROFILES_ACTIVE` | 无 | 生产部署设为 `prod` |

## 文档

- [架构说明](docs/architecture.md)
- [接口文档](docs/api.md)
- [开发指南](docs/development.md)
- [部署指南](docs/deployment.md)

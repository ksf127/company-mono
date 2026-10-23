# 部署指南

## 方式一：Docker Compose（推荐）

根目录 `docker-compose.yml` 包含三个服务：

| 服务 | 镜像/构建 | 端口 | 说明 |
| --- | --- | --- | --- |
| `mysql` | `mysql:8.0` | 3306 | 数据持久化到 `mysql-data` 卷 |
| `backend` | 根 `Dockerfile` 多阶段构建 | 8080 | Spring Boot jar |
| `web` | `web/Dockerfile` 多阶段构建 | 80 | Nginx 托管静态资源并代理 `/api` |

启动：

```bash
docker compose up -d --build
```

查看状态与日志：

```bash
docker compose ps
docker compose logs -f backend
```

停止：

```bash
docker compose down
```

停止并删除数据库数据（谨慎）：

```bash
docker compose down -v
```

访问：

- 前端：http://localhost
- 后端健康检查：http://localhost:8080/actuator/health
- Prometheus 指标：http://localhost:8080/actuator/prometheus

### 自定义配置

在根目录创建 `.env`（已被 `.gitignore` 忽略）：

```dotenv
MYSQL_ROOT_PASSWORD=change-me-root
DB_PASSWORD=change-me-app
JWT_SECRET=please-use-a-long-random-secret-at-least-32-bytes
JWT_EXPIRE_MINUTES=120
OTLP_TRACES_ENDPOINT=http://host.docker.internal:4318/v1/traces
OTLP_METRICS_ENDPOINT=http://host.docker.internal:4318/v1/metrics
```

> 生产环境必须覆盖 `JWT_SECRET`，长度至少 32 字节。

### 数据库初始化

- MySQL 容器首次启动会执行 `deploy/db/init/01-create-database.sql`，仅创建数据库与账号；
- 表结构与种子数据由后端启动时的 Flyway 自动执行；
- 如需重置，删除 `mysql-data` 卷后重新启动。

## 方式二：手动部署

### 后端

```bash
mvn -B -ntp -DskipTests package
java -jar target/company-mono-1.0.0-SNAPSHOT.jar --spring.profiles.active=prod
```

必须注入的环境变量：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DB_URL` | 是 | JDBC 连接串 |
| `DB_USERNAME` | 是 | 数据库账号 |
| `DB_PASSWORD` | 是 | 数据库密码 |
| `JWT_SECRET` | 是 | JWT 密钥（≥32 字节） |
| `JWT_EXPIRE_MINUTES` | 否 | 默认 120 |
| `DB_POOL_SIZE` | 否 | Hikari 最大连接数，默认 20 |
| `OTLP_TRACES_ENDPOINT` | 否 | 默认 `http://otel-collector:4318/v1/traces` |
| `OTLP_METRICS_ENDPOINT` | 否 | 默认 `http://otel-collector:4318/v1/metrics` |

生产配置特点：

- 关闭 SQL 控制台日志；
- 禁止 Flyway `clean`；
- 关键变量不提供默认值，缺失时启动失败，避免误连错误环境。

### 前端

```bash
cd web
npm ci
npm run build
```

将 `web/dist` 部署到 Nginx，示例配置参见 `web/nginx.conf`：

- `try_files $uri $uri/ /index.html` 支持前端路由；
- `/api/` 反向代理到后端服务；
- `/healthz` 可用于负载均衡健康检查。

若后端不在 `backend:8080`，修改 `proxy_pass` 地址即可。

## 健康检查与监控

| 端点 | 用途 |
| --- | --- |
| `GET /actuator/health` | 存活/就绪检查 |
| `GET /actuator/info` | 应用信息 |
| `GET /actuator/prometheus` | Prometheus 抓取 |

建议在编排平台中把 `/actuator/health` 配置为 readiness/liveness 探针。

链路与指标通过 OTLP 推送：

- 配置 `OTLP_TRACES_ENDPOINT`、`OTLP_METRICS_ENDPOINT` 指向 OTel Collector；
- `TRACING_SAMPLE_RATE` 控制采样率，生产建议按流量调整。

## 升级与回滚

1. 升级前备份数据库；
2. 新增 Flyway 脚本随新版本发布，旧脚本不得修改；
3. 应用发布后 Flyway 自动执行未应用的迁移；
4. 回滚应用版本时，注意数据库迁移通常是单向的，需评估兼容性；
5. 使用容器部署时建议保留上一版本镜像 tag，便于快速回滚。

## 已知限制

- 登出黑名单存放在单个 JVM 内存中，多实例部署时各实例不共享；生产建议替换为 Redis 实现；
- 项目未内置 RBAC 接口级鉴权，菜单/角色数据已就绪，如需按权限拦截可在 `JwtAuthFilter` 之后增加权限校验；
- 默认账号 `admin/admin123` 仅用于初始化，请在首次登录后修改密码。

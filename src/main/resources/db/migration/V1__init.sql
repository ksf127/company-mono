-- 模块化单体初始化脚本（Flyway V1）
-- 约定：所有表使用逻辑删除 deleted（0 正常 / 1 删除），时间字段由数据库维护。

CREATE TABLE IF NOT EXISTS sys_user (
    user_id     BIGINT       NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    user_name   VARCHAR(64)  NOT NULL COMMENT '登录账号',
    nick_name   VARCHAR(64)  NOT NULL COMMENT '用户昵称',
    password    VARCHAR(100) NOT NULL COMMENT 'BCrypt 密码',
    dept_id     BIGINT       NULL COMMENT '部门ID',
    phonenumber VARCHAR(20)  NULL COMMENT '手机号',
    email       VARCHAR(100) NULL COMMENT '邮箱',
    sex         CHAR(1)      NOT NULL DEFAULT '2' COMMENT '性别 0男 1女 2未知',
    status      CHAR(1)      NOT NULL DEFAULT '0' COMMENT '状态 0正常 1停用',
    remark      VARCHAR(500) NULL COMMENT '备注',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0正常 1删除',
    PRIMARY KEY (user_id),
    UNIQUE KEY uk_sys_user_user_name (user_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统用户';

CREATE TABLE IF NOT EXISTS sys_role (
    role_id     BIGINT       NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    role_name   VARCHAR(64)  NOT NULL COMMENT '角色名称',
    role_key    VARCHAR(64)  NOT NULL COMMENT '角色标识',
    role_sort   INT          NOT NULL DEFAULT 0 COMMENT '排序',
    status      CHAR(1)      NOT NULL DEFAULT '0' COMMENT '状态 0正常 1停用',
    remark      VARCHAR(500) NULL COMMENT '备注',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0正常 1删除',
    PRIMARY KEY (role_id),
    UNIQUE KEY uk_sys_role_role_key (role_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '系统角色';

CREATE TABLE IF NOT EXISTS sys_user_role (
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    PRIMARY KEY (user_id, role_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户角色关联';

CREATE TABLE IF NOT EXISTS sys_menu (
    menu_id     BIGINT       NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
    menu_name   VARCHAR(64)  NOT NULL COMMENT '菜单名称',
    parent_id   BIGINT       NOT NULL DEFAULT 0 COMMENT '父菜单ID，0 为根',
    order_num   INT          NOT NULL DEFAULT 0 COMMENT '排序',
    path        VARCHAR(200) NULL COMMENT '路由地址',
    component   VARCHAR(200) NULL COMMENT '组件标识',
    menu_type   CHAR(1)      NOT NULL DEFAULT 'C' COMMENT '类型 M目录 C菜单 F按钮',
    perms       VARCHAR(100) NULL COMMENT '权限标识',
    icon        VARCHAR(64)  NULL COMMENT '图标',
    status      CHAR(1)      NOT NULL DEFAULT '0' COMMENT '状态 0正常 1停用',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0正常 1删除',
    PRIMARY KEY (menu_id),
    KEY idx_sys_menu_parent (parent_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '菜单权限';

CREATE TABLE IF NOT EXISTS sys_role_menu (
    role_id BIGINT NOT NULL COMMENT '角色ID',
    menu_id BIGINT NOT NULL COMMENT '菜单ID',
    PRIMARY KEY (role_id, menu_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色菜单关联';

CREATE TABLE IF NOT EXISTS sys_dept (
    dept_id     BIGINT       NOT NULL AUTO_INCREMENT COMMENT '部门ID',
    parent_id   BIGINT       NOT NULL DEFAULT 0 COMMENT '父部门ID，0 为根',
    dept_name   VARCHAR(64)  NOT NULL COMMENT '部门名称',
    order_num   INT          NOT NULL DEFAULT 0 COMMENT '排序',
    leader      VARCHAR(64)  NULL COMMENT '负责人',
    phone       VARCHAR(20)  NULL COMMENT '联系电话',
    email       VARCHAR(100) NULL COMMENT '邮箱',
    status      CHAR(1)      NOT NULL DEFAULT '0' COMMENT '状态 0正常 1停用',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0正常 1删除',
    PRIMARY KEY (dept_id),
    KEY idx_sys_dept_parent (parent_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '部门';

CREATE TABLE IF NOT EXISTS sys_dict_type (
    dict_id     BIGINT       NOT NULL AUTO_INCREMENT COMMENT '字典类型ID',
    dict_name   VARCHAR(100) NOT NULL COMMENT '字典名称',
    dict_type   VARCHAR(100) NOT NULL COMMENT '字典类型编码',
    status      CHAR(1)      NOT NULL DEFAULT '0' COMMENT '状态 0正常 1停用',
    remark      VARCHAR(500) NULL COMMENT '备注',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0正常 1删除',
    PRIMARY KEY (dict_id),
    UNIQUE KEY uk_sys_dict_type_type (dict_type)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '字典类型';

CREATE TABLE IF NOT EXISTS sys_dict_data (
    dict_code   BIGINT       NOT NULL AUTO_INCREMENT COMMENT '字典数据ID',
    dict_sort   INT          NOT NULL DEFAULT 0 COMMENT '排序',
    dict_label  VARCHAR(100) NOT NULL COMMENT '字典标签',
    dict_value  VARCHAR(100) NOT NULL COMMENT '字典键值',
    dict_type   VARCHAR(100) NOT NULL COMMENT '字典类型编码',
    list_class  VARCHAR(100) NULL COMMENT '样式类名',
    is_default  CHAR(1)      NOT NULL DEFAULT '0' COMMENT '是否默认 0否 1是',
    status      CHAR(1)      NOT NULL DEFAULT '0' COMMENT '状态 0正常 1停用',
    remark      VARCHAR(500) NULL COMMENT '备注',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted     TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0正常 1删除',
    PRIMARY KEY (dict_code),
    KEY idx_sys_dict_data_type (dict_type)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '字典数据';

CREATE TABLE IF NOT EXISTS sys_config (
    config_id    BIGINT       NOT NULL AUTO_INCREMENT COMMENT '参数ID',
    config_name  VARCHAR(100) NOT NULL COMMENT '参数名称',
    config_key   VARCHAR(100) NOT NULL COMMENT '参数键名',
    config_value VARCHAR(500) NOT NULL COMMENT '参数键值',
    config_type  CHAR(1)      NOT NULL DEFAULT 'N' COMMENT '类型 Y内置 N自定义',
    remark       VARCHAR(500) NULL COMMENT '备注',
    create_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除 0正常 1删除',
    PRIMARY KEY (config_id),
    UNIQUE KEY uk_sys_config_key (config_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '参数配置';

CREATE TABLE IF NOT EXISTS sys_login_log (
    info_id    BIGINT       NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    user_name  VARCHAR(64)  NOT NULL COMMENT '登录账号',
    ipaddr     VARCHAR(64)  NULL COMMENT '登录IP',
    browser    VARCHAR(255) NULL COMMENT '浏览器信息',
    os         VARCHAR(64)  NULL COMMENT '操作系统',
    status     CHAR(1)      NOT NULL DEFAULT '0' COMMENT '状态 0成功 1失败',
    msg        VARCHAR(255) NULL COMMENT '提示信息',
    login_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
    PRIMARY KEY (info_id),
    KEY idx_sys_login_log_user (user_name),
    KEY idx_sys_login_log_time (login_time)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '登录日志';

CREATE TABLE IF NOT EXISTS biz_order (
    order_id      BIGINT        NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    order_no      VARCHAR(32)   NOT NULL COMMENT '订单号',
    customer_name VARCHAR(100)  NOT NULL COMMENT '客户名称',
    amount        DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT '订单金额',
    status        VARCHAR(20)   NOT NULL DEFAULT 'CREATED' COMMENT '状态 CREATED/PAID/SHIPPED/COMPLETED/CANCELLED',
    remark        VARCHAR(500)  NULL COMMENT '备注',
    create_time   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted       TINYINT       NOT NULL DEFAULT 0 COMMENT '逻辑删除 0正常 1删除',
    PRIMARY KEY (order_id),
    UNIQUE KEY uk_biz_order_no (order_no),
    KEY idx_biz_order_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '示例订单';

-- ===== 种子数据 =====
-- 默认管理员 admin / admin123（BCrypt），首次登录后请立即修改密码
INSERT IGNORE INTO sys_user (user_id, user_name, nick_name, password, dept_id, phonenumber, email, sex, status, remark)
VALUES (1, 'admin', '超级管理员', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 100, '13800000000', 'admin@company.com', '0', '0', '内置管理员');

INSERT IGNORE INTO sys_role (role_id, role_name, role_key, role_sort, status, remark)
VALUES (1, '超级管理员', 'admin', 1, '0', '拥有全部菜单'),
       (2, '普通用户', 'common', 2, '0', '只读示例');

INSERT IGNORE INTO sys_user_role (user_id, role_id)
VALUES (1, 1);

INSERT IGNORE INTO sys_dept (dept_id, parent_id, dept_name, order_num, leader, phone, email, status)
VALUES (100, 0, '总公司', 1, '管理员', '13800000000', 'admin@company.com', '0'),
       (101, 100, '研发部', 1, '张工', '13900000000', 'dev@company.com', '0');

INSERT IGNORE INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, menu_type, perms, icon, status)
VALUES (1, '仪表盘', 0, 1, '/dashboard', 'DashboardPage', 'C', 'dashboard:view', 'dashboard', '0'),
       (2, '系统管理', 0, 2, '/system', 'Layout', 'M', NULL, 'setting', '0'),
       (3, '用户管理', 2, 1, '/system/users', 'UserPage', 'C', 'system:user:list', 'user', '0'),
       (4, '角色管理', 2, 2, '/system/roles', 'RolePage', 'C', 'system:role:list', 'team', '0'),
       (5, '菜单管理', 2, 3, '/system/menus', 'MenuPage', 'C', 'system:menu:list', 'menu', '0'),
       (6, '部门管理', 2, 4, '/system/depts', 'DeptPage', 'C', 'system:dept:list', 'apartment', '0'),
       (7, '字典管理', 2, 5, '/system/dicts', 'DictPage', 'C', 'system:dict:list', 'book', '0'),
       (8, '参数设置', 2, 6, '/system/configs', 'ConfigPage', 'C', 'system:config:list', 'tool', '0'),
       (9, '登录日志', 2, 7, '/system/logs', 'LoginLogPage', 'C', 'system:log:list', 'file', '0'),
       (10, '订单示例', 0, 3, '/orders', 'OrderPage', 'C', 'order:list', 'shopping', '0');

INSERT IGNORE INTO sys_role_menu (role_id, menu_id)
VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
       (2, 1), (2, 10);

INSERT IGNORE INTO sys_dict_type (dict_id, dict_name, dict_type, status, remark)
VALUES (1, '系统开关', 'sys_normal_disable', '0', '通用启用/停用状态'),
       (2, '用户性别', 'sys_user_sex', '0', '用户性别列表');

INSERT IGNORE INTO sys_dict_data (dict_code, dict_sort, dict_label, dict_value, dict_type, list_class, is_default, status, remark)
VALUES (1, 1, '正常', '0', 'sys_normal_disable', 'success', '1', '0', '正常状态'),
       (2, 2, '停用', '1', 'sys_normal_disable', 'danger', '0', '0', '停用状态'),
       (3, 1, '男', '0', 'sys_user_sex', 'default', '1', '0', '性别男'),
       (4, 2, '女', '1', 'sys_user_sex', 'default', '0', '0', '性别女');

INSERT IGNORE INTO sys_config (config_id, config_name, config_key, config_value, config_type, remark)
VALUES (1, '系统名称', 'sys.app.name', 'company-mono', 'Y', '页面标题'),
       (2, '用户初始密码', 'sys.user.initPassword', '123456', 'Y', '新建用户默认密码');

INSERT IGNORE INTO biz_order (order_id, order_no, customer_name, amount, status, remark)
VALUES (1, 'SO202601010001', '示例客户A', 1280.00, 'CREATED', '演示订单，可直接流转状态'),
       (2, 'SO202601010002', '示例客户B', 640.50, 'PAID', '演示已支付订单');

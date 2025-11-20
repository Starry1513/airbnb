# Quick Vercel Deployment Guide

## 🚀 快速部署 - 5 分钟完成

### 步骤 1: 设置本地环境变量

创建 `.env.local` 文件：

```bash
cd backend
cat > .env.local << 'EOF'
JWT_SECRET=airbrb-secret-key-change-in-production
DATABASE_URL=postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL=postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
EOF
```

### 步骤 2: 初始化数据库

```bash
npm run db:migrate
```

应该看到：
```
✅ Database schema created successfully!
```

### 步骤 3: 测试本地

```bash
npm run dev
```

访问: http://localhost:3000/api/docs

### 步骤 4: 部署到 Vercel

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 步骤 5: 配置 Vercel Supabase 集成（推荐）

如果你使用了 **Vercel Supabase 集成**，Vercel 会自动创建环境变量。你只需要：

1. **在 Vercel Dashboard 中连接 Supabase**：
   - 项目设置 → Integrations → Supabase → Connect
   - 选择你的 Supabase 项目
   - 选择环境：**Development, Preview, Production**（全选）
   - Supabase Preview Branch：选择 **Production**

2. **Vercel 会自动创建以下变量**：
   - `POSTGRES_URL` - 连接池 URL（推荐用于 serverless）
   - `POSTGRES_URL_NON_POOLING` - 直连 URL
   - `POSTGRES_PRISMA_URL` - Prisma 格式 URL
   - `DATABASE_URL` - 通常与 `POSTGRES_URL` 相同

3. **你只需要手动添加 `JWT_SECRET`**：

```bash
vercel env add JWT_SECRET production
# 输入: airbrb-secret-key-change-in-production
```

或者在 **Vercel Dashboard → 项目设置 → Environment Variables** 添加：

| Variable | Value | 环境 |
|----------|-------|------|
| `JWT_SECRET` | `airbrb-secret-key-change-in-production` | Production, Preview, Development |

> **注意**：`DATABASE_URL` 和 `POSTGRES_URL` 会由 Vercel Supabase 集成自动创建，无需手动添加。

### 步骤 5 备选方案: 手动设置环境变量

如果没有使用 Vercel Supabase 集成，可以手动设置：

```bash
# 方式 1: CLI
vercel env add JWT_SECRET production
# 输入: airbrb-secret-key-change-in-production

vercel env add DATABASE_URL production
# 输入: 你的 Supabase 连接 URL

vercel env add POSTGRES_URL production
# 输入: 同上
```

或者在 **Vercel Dashboard → 项目设置 → Environment Variables** 添加：

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | `airbrb-secret-key-change-in-production` |
| `DATABASE_URL` | `postgres://postgres.xxx:xxx@xxx:6543/postgres?sslmode=require` |
| `POSTGRES_URL` | 同上 |

### 步骤 6: 重新部署

```bash
vercel --prod
```

### 步骤 7: 测试部署

```bash
# 替换成你的 Vercel URL
curl https://your-app.vercel.app/api/listings
```

## ✅ 完成！

你的 API 现在已经部署并运行在：
- **API**: `https://your-app.vercel.app/api`
- **文档**: `https://your-app.vercel.app/api/docs`

## 📝 后续步骤

1. **更新前端配置**，将 API URL 改为你的 Vercel URL
2. **修改 JWT_SECRET** 为更强的密钥（生产环境）
3. **配置 CORS** 允许你的前端域名（在 `api/_lib/handler.ts`）

## 🔧 常用命令

```bash
# 本地开发
npm run dev

# 查看日志
vercel logs

# 查看环境变量
vercel env ls

# 重新部署
vercel --prod
```

## 📚 详细文档

- **完整部署指南**: 查看 `POSTGRES_SETUP.md`
- **API 文档**: 访问 `/api/docs`
- **数据库 Schema**: 查看 `database/schema.sql`

## 📋 Vercel Supabase 集成环境变量说明

如果你使用了 Vercel Supabase 集成，Vercel 会自动创建以下环境变量（以 `s_` 开头）：

| 变量名 | 说明 | 项目使用 |
|--------|------|---------|
| `s_POSTGRES_URL` | 连接池 URL（推荐） | ✅ 自动映射为 `POSTGRES_URL` |
| `s_POSTGRES_URL_NON_POOLING` | 直连 URL | 可选 |
| `s_POSTGRES_PRISMA_URL` | Prisma 格式 URL | 如果使用 Prisma |
| `s_POSTGRES_HOST` | 数据库主机 | 通常不需要 |
| `s_POSTGRES_USER` | 数据库用户 | 通常不需要 |
| `s_POSTGRES_PASSWORD` | 数据库密码 | 通常不需要 |
| `s_POSTGRES_DATABASE` | 数据库名 | 通常不需要 |
| `s_SUPABASE_URL` | Supabase 项目 URL | 前端可能需要 |
| `s_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | 前端可能需要 |
| `s_SUPABASE_SERVICE_ROLE_KEY` | Supabase 服务角色密钥 | 后端高级功能 |
| `s_SUPABASE_JWT_SECRET` | Supabase JWT 密钥 | 可选 |

**重要**：
- Vercel 会自动将 `s_POSTGRES_URL` 映射为标准的 `POSTGRES_URL` 和 `DATABASE_URL`
- 你的代码直接使用 `DATABASE_URL` 或 `POSTGRES_URL`，无需修改
- 前端如果需要 Supabase 客户端，可以使用 `s_SUPABASE_URL` 和 `s_SUPABASE_ANON_KEY`

## ❓ 问题排查

### Serverless Function 崩溃 (500 错误)

如果遇到 `FUNCTION_INVOCATION_FAILED` 错误，按以下步骤排查：

#### 1. 查看 Vercel 日志

**方法 1：Vercel Dashboard**
1. 进入项目 → Deployments
2. 点击失败的部署
3. 查看 "Functions" 标签页的日志

**方法 2：Vercel CLI**
```bash
vercel logs [deployment-url] --follow
```

#### 2. 检查环境变量

```bash
# 查看所有环境变量
vercel env ls

# 确认以下变量存在：
# - POSTGRES_URL 或 DATABASE_URL
# - JWT_SECRET
```

**常见错误信息**：
- `Database connection string not configured` → 环境变量未设置
- `Connection refused` → 数据库连接失败
- `relation "users" does not exist` → 数据库表未创建（需要运行迁移）

#### 3. 验证数据库连接

在本地测试数据库连接：
```bash
cd backend
# 确保 .env.local 中有正确的 DATABASE_URL
node test-db.js
```

#### 4. 检查数据库迁移

如果看到 `relation "users" does not exist` 错误，需要运行迁移：

```bash
# 使用生产环境变量运行迁移
DATABASE_URL="你的生产环境URL" npm run db:migrate
```

或者在 Supabase Dashboard → SQL Editor 中手动执行 `database/schema.sql`

#### 5. 常见问题及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `DATABASE_URL not set` | 环境变量未配置 | 在 Vercel Dashboard 添加环境变量 |
| `Connection timeout` | 数据库连接超时 | 检查 Supabase 项目是否运行，网络是否正常 |
| `relation does not exist` | 数据库表未创建 | 运行 `npm run db:migrate` |
| `Invalid JWT` | JWT_SECRET 不匹配 | 确保所有环境使用相同的 JWT_SECRET |
| `SSL connection required` | SSL 配置问题 | 确保连接 URL 包含 `?sslmode=require` |

### 数据库连接失败
检查环境变量是否正确设置：
```bash
vercel env ls
```

确认以下变量存在：
- `POSTGRES_URL` 或 `DATABASE_URL`（由 Vercel Supabase 集成自动创建）
- `JWT_SECRET`（需要手动添加）

### CORS 错误
更新 `api/_lib/handler.ts` 中的 `enableCors` 函数

### JWT 错误
确保 `JWT_SECRET` 在所有环境中一致

### 环境变量未找到
如果代码中无法读取到 `DATABASE_URL` 或 `POSTGRES_URL`：
1. 检查 Vercel Dashboard → Environment Variables
2. 确认 Supabase 集成已正确连接
3. 重新部署项目：`vercel --prod`

### 调试技巧

1. **添加详细日志**：
   - 在代码中使用 `console.log()` 输出调试信息
   - 日志会出现在 Vercel Dashboard → Deployments → Functions 标签

2. **测试单个端点**：
   ```bash
   curl https://your-app.vercel.app/api/listings
   ```

3. **检查函数配置**：
   - 确认 `vercel.json` 中的函数配置正确
   - 检查内存限制（当前 1024MB）和超时时间（10秒）

---

需要帮助？查看完整文档 `POSTGRES_SETUP.md`

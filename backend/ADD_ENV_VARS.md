# 快速添加环境变量到 Vercel

## 🚨 问题
Serverless Function 崩溃是因为环境变量未设置。

## ✅ 解决方案

**好消息！** 代码已经更新，现在支持你现有的 `starry_` 前缀变量。但为了更好的兼容性，建议添加标准名称的变量。

### 方法 1: 使用你现有的变量（代码已支持）

代码已经修改，可以自动识别 `starry_POSTGRES_URL` 和 `starry_JWT_SECRET`。

**但是**，你还需要添加 `JWT_SECRET`（应用自己的 JWT 密钥，不是 Supabase 的）。

### 方法 2: 在 Vercel Dashboard 添加标准变量（推荐）

1. **打开 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 选择你的项目 `backend`

2. **进入环境变量设置**
   - 点击项目 → Settings → Environment Variables

3. **添加以下环境变量**

#### 变量 1: POSTGRES_URL
- **Key**: `POSTGRES_URL`
- **Value**: 复制你现有的 `starry_POSTGRES_URL` 的值：
  ```
  postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
  ```
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### 变量 2: DATABASE_URL（可选，与 POSTGRES_URL 相同）
- **Key**: `DATABASE_URL`
- **Value**: 与 POSTGRES_URL 相同的值
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

#### 变量 3: JWT_SECRET（必需！）
- **Key**: `JWT_SECRET`
- **Value**: `airbrb-secret-key-change-in-production`（这是应用自己的 JWT 密钥，不是 Supabase 的）
- **Environment**: ✅ Production, ✅ Preview, ✅ Development

> **注意**：`JWT_SECRET` 是应用用来签名用户 token 的密钥，与 `starry_SUPABASE_JWT_SECRET` 不同。

4. **保存并重新部署**
   - 点击 "Save"
   - 回到 Deployments 标签
   - 点击最新部署的 "..." → "Redeploy"

### 方法 3: 使用 Vercel CLI

```bash
cd backend

# 1. 添加 POSTGRES_URL（使用你现有的 starry_POSTGRES_URL 的值）
vercel env add POSTGRES_URL production
# 粘贴: postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x

# 2. 添加 JWT_SECRET（这是应用自己的密钥，不是 Supabase 的）
vercel env add JWT_SECRET production
# 输入: airbrb-secret-key-change-in-production

# 3. 为 Preview 和 Development 环境也添加（可选但推荐）
vercel env add POSTGRES_URL preview
vercel env add JWT_SECRET preview

vercel env add POSTGRES_URL development
vercel env add JWT_SECRET development
```

## 📝 重要说明

### 关于变量名称

- **`starry_POSTGRES_URL`**: 这是 Vercel Supabase 集成自动创建的变量（带前缀）
- **`POSTGRES_URL`**: 这是代码期望的标准变量名
- **代码已更新**：现在代码会自动尝试使用 `starry_POSTGRES_URL` 作为后备

### 关于 JWT_SECRET

- **`starry_SUPABASE_JWT_SECRET`**: 这是 Supabase 的 JWT 密钥（用于 Supabase 内部）
- **`JWT_SECRET`**: 这是**你的应用**用来签名用户登录 token 的密钥
- **这两个是不同的！** 你需要为应用创建一个自己的 `JWT_SECRET`

### 验证环境变量

```bash
vercel env ls
```

应该看到：
- ✅ `POSTGRES_URL`
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`

### 重新部署

```bash
vercel --prod
```

## 🎯 完成！

部署后，你的 API 应该可以正常工作了。

测试：
```bash
curl https://your-app.vercel.app/api/listings
```


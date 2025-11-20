# 完整修复检查清单

## ✅ 已完成的代码修复

### 后端修复
- [x] 路径匹配：支持 `/api` 前缀
- [x] 错误处理：改进错误日志和分类
- [x] 请求体解析：改进 JSON 解析
- [x] 数据库连接：延迟创建，更好的错误处理
- [x] 日志记录：详细的请求和错误日志

### 前端配置
- [x] API 路径：使用 `/user/auth/register`（正确）
- [x] 错误处理：显示错误消息
- [x] 请求格式：JSON 格式正确

## 🔧 需要手动配置的步骤

### 1. 环境变量配置（必需）

在 Vercel Dashboard → Settings → Environment Variables 添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `POSTGRES_URL` | `postgres://postgres.lglthuuxojxyejqlnwmp:8vv3ndpmKvVlCcfA@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x` | Production, Preview, Development |
| `DATABASE_URL` | 同上 | Production, Preview, Development |
| `JWT_SECRET` | `airbrb-secret-key-change-in-production` | Production, Preview, Development |

**或者使用 CLI**：
```bash
cd backend
vercel env add POSTGRES_URL production
# 粘贴连接字符串

vercel env add JWT_SECRET production
# 输入: airbrb-secret-key-change-in-production
```

### 2. 数据库迁移（如果需要）

如果看到 "relation does not exist" 错误：

```bash
cd backend
DATABASE_URL="你的生产环境URL" npm run db:migrate
```

### 3. 前端环境变量（如果部署到 Vercel）

如果前端也部署到 Vercel，需要设置：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_API_BASE` | `https://your-backend.vercel.app/api` | 后端 API URL |

## 🚀 部署步骤

### 1. 重新部署后端
```bash
cd backend
vercel --prod
```

### 2. 验证部署
```bash
# 查看环境变量
vercel env ls

# 查看日志
vercel logs --follow
```

### 3. 测试 API
```bash
# 测试注册
curl -X POST https://your-app.vercel.app/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# 应该返回: {"token":"..."}
```

## 🔍 调试步骤

### 如果仍然看到 "A system error occurred"

1. **查看 Vercel 日志**：
   ```bash
   vercel logs --follow
   ```
   查找：
   - `[POST] /user/auth/register` - 请求日志
   - `Register request body:` - 请求体内容
   - `[catchErrors] Caught error:` - 错误详情

2. **检查环境变量**：
   ```bash
   vercel env ls
   ```
   确认 `POSTGRES_URL` 和 `JWT_SECRET` 存在

3. **测试数据库连接**：
   ```bash
   cd backend
   node test-db.js
   ```

4. **检查浏览器控制台**：
   - Network 标签 → 查看请求详情
   - Console 标签 → 查看错误信息

## 📊 预期行为

### 成功情况
- ✅ 注册成功：返回 `{"token":"..."}`
- ✅ 日志显示：`✅ Executed query`
- ✅ 状态码：200

### 错误情况（现在会有清晰提示）
- ❌ 数据库连接失败：`Database connection failed. Please check environment variables.`
- ❌ Schema 错误：`Database schema error. Please run migrations.`
- ❌ 字段缺失：`Must provide: email, password, name`
- ❌ 其他错误：详细日志 + 开发环境显示详情

## 🎯 关键改进点

1. **路径处理**：现在自动处理 `/api` 前缀
2. **错误信息**：不再是模糊的 "A system error occurred"
3. **日志记录**：所有请求和错误都有详细日志
4. **数据库错误**：特殊处理，提供清晰的错误信息

## ⚠️ 注意事项

1. **环境变量**：必须在 Vercel Dashboard 中设置，不能只在本地 `.env.local`
2. **数据库迁移**：生产环境需要单独运行迁移
3. **日志查看**：使用 `vercel logs` 查看实时日志
4. **开发环境**：错误响应会包含更多详情（仅开发环境）

## 📝 下一步

1. [ ] 在 Vercel Dashboard 添加环境变量
2. [ ] 重新部署后端
3. [ ] 查看日志确认无错误
4. [ ] 测试注册功能
5. [ ] 如果前端也部署，配置 `VITE_API_BASE`



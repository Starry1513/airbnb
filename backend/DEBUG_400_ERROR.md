# 调试 400 Bad Request 错误

## 🔍 问题
注册端点返回 400 错误：`Failed to load resource: the server responded with a status of 400 (Bad Request)`

## 📋 可能的原因

### 1. 请求体格式问题
- 前端发送的 JSON 格式不正确
- Content-Type 头缺失或错误
- 字段缺失或为空

### 2. 后端验证失败
- `email`、`password` 或 `name` 字段为空
- 字段类型不正确

## 🔧 排查步骤

### 步骤 1: 检查浏览器控制台

打开浏览器开发者工具（F12），查看：
1. **Network 标签** → 找到失败的请求
2. **查看 Request Payload**：
   ```json
   {
     "email": "test@example.com",
     "password": "test123",
     "name": "Test User"
   }
   ```
3. **查看 Response**：应该显示具体的错误信息

### 步骤 2: 检查 Vercel 日志

```bash
# 查看实时日志
vercel logs --follow

# 或者查看特定部署的日志
vercel logs [deployment-url]
```

在日志中查找：
- `Register request body:` - 应该显示接收到的数据
- 错误信息

### 步骤 3: 测试 API 端点

使用 curl 直接测试：

```bash
curl -X POST https://your-app.vercel.app/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

### 步骤 4: 检查前端配置

确认前端 API 配置正确：

1. **检查 API_BASE_URL**：
   ```typescript
   // frontend/src/api/config.ts
   export const API_BASE_URL = import.meta.env?.VITE_API_BASE ?? `http://localhost:5005`;
   ```

2. **确认请求格式**：
   ```typescript
   // frontend/src/api/auth.ts
   export const registerUser = async ({ email, password, name }) => {
     return apiCall('/user/auth/register', {
       method: 'POST',
       body: JSON.stringify({ email, password, name }),
     });
   };
   ```

## 🐛 常见问题

### 问题 1: 请求体为空

**症状**：日志显示 `body: undefined` 或 `body: {}`

**解决**：
- 检查 Content-Type 头是否正确设置为 `application/json`
- 确认前端正确发送了 JSON 数据

### 问题 2: 字段缺失

**症状**：错误信息显示 `Must provide: email, password, name`

**解决**：
- 检查前端表单是否正确收集了所有字段
- 确认字段名拼写正确（`email`, `password`, `name`）

### 问题 3: API URL 错误

**症状**：请求发送到错误的 URL（如 `:5005/auth/register`）

**解决**：
- 检查 `VITE_API_BASE` 环境变量
- 确认 API_BASE_URL 配置正确
- 完整 URL 应该是：`http://localhost:5005/user/auth/register` 或 `https://your-app.vercel.app/api/user/auth/register`

## ✅ 验证修复

修复后，应该看到：

1. **浏览器 Network 标签**：
   - Status: `200 OK`
   - Response: `{ "token": "..." }`

2. **Vercel 日志**：
   ```
   Register request body: { email: 'test@example.com', password: 'test123', name: 'Test User' }
   ```

## 📝 代码更新

代码已更新，现在会：
1. ✅ 记录详细的请求体信息
2. ✅ 在调用 register 前验证字段
3. ✅ 返回更清晰的错误信息

## 🚀 重新部署

修复后重新部署：

```bash
cd backend
vercel --prod
```



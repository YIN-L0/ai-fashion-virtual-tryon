# 部署指南

## 部署到 Vercel (推荐)

Vercel 是 Next.js 的官方推荐部署平台，提供免费托管。

### 步骤 1: 安装 Vercel CLI

```bash
npm install -g vercel
```

### 步骤 2: 登录 Vercel

```bash
vercel login
```

按提示完成登录（可选择 GitHub、GitLab 或 Email）。

### 步骤 3: 部署应用

在项目根目录运行：

```bash
vercel
```

首次部署时会提示：
- Set up and deploy? **Y**
- Which scope? 选择你的账户
- Link to existing project? **N** 
- Project name? 回车使用默认名称 `fashn-tryon4`
- In which directory is your code located? 回车使用当前目录 `./`

### 步骤 4: 配置环境变量

部署后，需要在 Vercel 控制台设置环境变量：

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加环境变量：
   - **Name**: `FASHN_API_KEY`
   - **Value**: `fa-lt14ddiVbyfI-IGGCvQVge7vDkwjwz5B2uvT0`
   - **Environment**: 选择 `Production`, `Preview`, `Development`

### 步骤 5: 重新部署

设置环境变量后，重新部署以应用更改：

```bash
vercel --prod
```

### 完成！

你会得到一个公开的 URL，类似：
`https://fashn-tryon4-xxxxx.vercel.app`

---

## 其他部署选项

### Netlify 部署

1. 安装 Netlify CLI:
```bash
npm install -g netlify-cli
```

2. 构建项目:
```bash
npm run build
npm run export  # 需要在 next.config.js 中配置静态导出
```

3. 部署:
```bash
netlify deploy --dir=out --prod
```

### Railway 部署

1. 访问 [Railway](https://railway.app)
2. 连接 GitHub 仓库
3. 设置环境变量 `FASHN_API_KEY`
4. 自动部署

---

## 部署前检查清单

- 应用在本地正常运行 (`npm run dev`)
- 构建成功 (`npm run build`)
- 环境变量已配置
- `.gitignore` 已设置
- 依赖包已正确安装

## 常见问题

**Q: 部署后 API 调用失败？**
A: 检查环境变量是否正确设置，特别是 `FASHN_API_KEY`。

**Q: 构建失败？**
A: 运行 `npm run build` 检查本地构建是否成功。

**Q: 图片无法显示？**
A: 确保图片 URL 是公开可访问的，且支持 CORS。

## 性能优化建议

- 启用 Vercel 的 Edge Functions
- 配置适当的缓存策略
- 使用 Vercel Analytics 监控性能
- 考虑添加图片优化和 CDN

---

**需要帮助？** 查看 [Vercel 文档](https://vercel.com/docs) 或联系技术支持。

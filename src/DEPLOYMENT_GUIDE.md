# 🚀 MACMAA 网站部署指南（Vercel）

## 📋 问题诊断

如果您的 Vercel 部署网站缺少动画效果和骨架屏，是因为以下库没有正确安装：

1. **Motion (Framer Motion)** - 用于所有动画效果
2. **其他依赖库** - 可能缺失

---

## ✅ 解决方案：创建 `package.json`

### **步骤 1：在项目根目录创建 `package.json` 文件**

在您的项目根目录（和 `App.tsx` 同级）创建一个名为 `package.json` 的文件，内容如下：

```json
{
  "name": "macmaa-website",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "motion": "^10.18.0",
    "lucide-react": "^0.344.0",
    "react-easy-crop": "^5.0.4",
    "sonner": "^1.4.3",
    "react-hook-form": "^7.55.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.1",
    "recharts": "^2.12.0",
    "embla-carousel-react": "^8.0.0",
    "date-fns": "^3.3.1",
    "react-day-picker": "^8.10.0",
    "cmdk": "^0.2.1",
    "vaul": "^0.9.0",
    "react-resizable-panels": "^2.0.12",
    "input-otp": "^1.2.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.8",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.4.3"
  }
}
```

---

## 🔧 Vercel 部署配置

### **步骤 2：创建 `vercel.json` 配置文件**

在项目根目录创建 `vercel.json` 文件：

```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📦 Vercel 部署步骤

### **方法 1：通过 Vercel Dashboard（推荐）**

1. **登录 Vercel**：访问 [vercel.com](https://vercel.com)
2. **导入项目**：点击 "Add New" → "Project"
3. **连接 Git 仓库**：选择您的 GitHub/GitLab/Bitbucket 仓库
4. **配置构建设置**：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. **部署**：点击 "Deploy" 按钮

### **方法 2：使用 Vercel CLI**

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
vercel

# 4. 部署到生产环境
vercel --prod
```

---

## 🎨 确保动画效果正常的检查清单

### ✅ **必须确认的事项：**

- [ ] `package.json` 文件已创建并包含 `motion` 依赖
- [ ] `package.json` 中包含所有 `@radix-ui/*` 依赖
- [ ] `vercel.json` 配置文件已创建
- [ ] Vercel 构建日志中没有错误
- [ ] 部署后的网站可以正常访问

### 🔍 **如何验证部署成功：**

部署完成后，打开您的 Vercel 网站，应该看到：

1. ✅ **骨架屏动画**：新闻和活动列表加载时有闪烁效果
2. ✅ **卡片悬停动画**：鼠标悬停在卡片上会有上浮效果
3. ✅ **页面淡入动画**：页面加载时元素从下方淡入
4. ✅ **轮播图过渡**：首页精彩瞬间有平滑的淡入淡出效果
5. ✅ **菜单动画**：移动端菜单打开/关闭有滑动效果

---

## 🐛 常见问题排查

### **问题 1：动画仍然不工作**

**原因**：`motion` 库可能没有正确安装

**解决方案**：
1. 检查 Vercel 构建日志，确认 `npm install` 成功
2. 确保 `package.json` 中有 `"motion": "^10.18.0"`
3. 重新部署项目

### **问题 2：页面加载很慢**

**原因**：图片没有优化

**解决方案**：
- Figma Make 已经使用了 `ImageWithFallback` 组件
- 图片会自动懒加载
- 如果仍然很慢，考虑使用 Vercel Image Optimization

### **问题 3：路由不工作（404错误）**

**原因**：Vercel 不知道如何处理 React Router

**解决方案**：
- 确保 `vercel.json` 中有 `rewrites` 配置
- 所有路由请求都应该重定向到 `index.html`

### **问题 4：构建失败**

**原因**：依赖版本冲突

**解决方案**：
1. 删除 `node_modules` 和 `package-lock.json`
2. 运行 `npm install`
3. 重新部署

---

## 📊 部署后性能优化建议

### **1. 启用 Vercel Analytics**
```bash
# 在 Vercel Dashboard 中启用 Analytics
Project Settings → Analytics → Enable
```

### **2. 配置缓存策略**

在 `vercel.json` 中添加：
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### **3. 压缩图片**
- 使用 WebP 格式
- 使用 Vercel Image Optimization API

---

## 🎯 最终检查

部署完成后，访问您的网站并测试：

| 功能 | 预期效果 | 状态 |
|------|---------|------|
| 首页轮播图 | 平滑淡入淡出（1秒过渡） | ⬜ |
| 卡片悬停 | 向上浮动 8px | ⬜ |
| 骨架屏 | 闪烁加载动画（800ms） | ⬜ |
| 页面切换 | 元素从下方淡入 | ⬜ |
| 移动端菜单 | 滑动打开/关闭 | ⬜ |
| 图片加载 | 懒加载 + 占位符 | ⬜ |

---

## 💡 额外建议

### **使用 Vercel Preview Deployments**
- 每次 Git push 都会创建预览部署
- 可以在合并到主分支前测试更改

### **设置自定义域名**
```
Project Settings → Domains → Add Domain
```

### **配置环境变量**
如果将来需要使用 Supabase 等后端服务：
```
Project Settings → Environment Variables
```

---

## 🆘 需要帮助？

如果部署后仍有问题：

1. **检查 Vercel 构建日志**：
   - Dashboard → Deployments → 点击部署 → View Function Logs

2. **检查浏览器控制台**：
   - 按 F12 打开开发者工具
   - 查看 Console 和 Network 标签

3. **常见错误信息**：
   - `Cannot find module 'motion'` → `package.json` 缺少依赖
   - `404 Not Found` → `vercel.json` 缺少路由配置
   - `Build failed` → 检查构建日志中的具体错误

---

## ✨ 总结

您的 Vercel 部署缺少动画效果的主要原因是 **`package.json` 文件缺失或不完整**。按照以上步骤创建 `package.json` 和 `vercel.json` 文件，重新部署后，您的网站应该和 Figma Make 中的效果完全一致！

祝部署顺利！🎉

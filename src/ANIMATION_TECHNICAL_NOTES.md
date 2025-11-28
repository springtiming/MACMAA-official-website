# 🎨 MACMAA 网站动画技术说明

## 📋 动画技术栈概览

本项目使用了**两种动画技术**的组合：

### **1. Motion (Framer Motion) - 主要动画库**
- **用途**：页面元素动画、过渡效果、交互动画
- **导入方式**：`import { motion } from 'motion/react'`
- **依赖声明**：`"motion": "^10.18.0"` (在 package.json 中)

### **2. 自定义 CSS 动画**
- **用途**：骨架屏 shimmer 效果
- **位置**：`/styles/globals.css`
- **不需要额外依赖**：纯 CSS 实现

---

## 🔍 详细动画清单

### **A. Motion 动画（需要 npm 包）**

#### **1️⃣ 页面加载动画**
**文件**：`/pages/Home.tsx`, `/pages/NewsList.tsx`, `/pages/EventList.tsx`

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6 }}
>
  {/* 内容 */}
</motion.div>
```

**效果**：元素从下方 20px 处淡入并上升

---

#### **2️⃣ 卡片悬停动画**
**文件**：`/pages/Home.tsx`, `/pages/NewsList.tsx`, `/pages/EventList.tsx`

```tsx
<motion.div
  whileHover={{ y: -8 }}
  transition={{ duration: 0.3 }}
>
  {/* 卡片内容 */}
</motion.div>
```

**效果**：鼠标悬停时卡片向上浮动 8px

---

#### **3️⃣ 轮播图淡入淡出**
**文件**：`/pages/Home.tsx`

```tsx
<motion.div
  key={currentImageIndex}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 1, ease: "easeInOut" }}
>
  {/* 图片 */}
</motion.div>
```

**效果**：图片切换时 1 秒平滑过渡

---

#### **4️⃣ 移动端菜单动画**
**文件**：`/components/Header.tsx`

```tsx
<motion.div
  initial={{ x: "100%" }}
  animate={{ x: 0 }}
  exit={{ x: "100%" }}
  transition={{ type: "spring", damping: 20 }}
>
  {/* 菜单内容 */}
</motion.div>
```

**效果**：菜单从右侧滑入/滑出

---

#### **5️⃣ 列表项渐进式加载**
**文件**：`/pages/NewsList.tsx`, `/pages/EventList.tsx`

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1, duration: 0.4 }}
>
  {/* 列表项 */}
</motion.div>
```

**效果**：列表项依次淡入，每项延迟 0.1 秒

---

### **B. CSS 自定义动画（不需要 npm 包）**

#### **6️⃣ 骨架屏 Shimmer 效果**
**文件**：`/styles/globals.css`

```css
/* 定义 shimmer 动画 */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 使用 shimmer 动画 */
.animate-shimmer {
  animation: shimmer 2s infinite;
}
```

**使用位置**：`/components/SkeletonCard.tsx`

```tsx
<div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
```

**效果**：骨架屏占位符从左到右闪烁动画（2 秒循环）

---

## 🚀 Vercel 部署检查清单

### **✅ 必须确保的配置：**

#### **1. package.json 必须包含 Motion**
```json
{
  "dependencies": {
    "motion": "^10.18.0"  // ← 这个最重要！
  }
}
```

**为什么重要**：
- 如果缺少这个依赖，所有 Motion 动画都不会工作
- 页面会显示，但没有任何动画效果
- 骨架屏不会闪烁（因为没有加载状态）

---

#### **2. styles/globals.css 必须被导入**
**位置**：`/App.tsx`

```tsx
import './styles/globals.css';  // ← 必须有这行！
```

**为什么重要**：
- 如果没有导入，`animate-shimmer` 类不会生效
- 骨架屏会显示，但不会有闪烁效果
- 其他自定义样式也会丢失

---

#### **3. Tailwind CSS v4 配置**
**位置**：`/styles/globals.css` (顶部)

```css
@custom-variant dark (&:is(.dark *));

:root {
  /* CSS 变量定义 */
}

@theme inline {
  /* Tailwind 主题配置 */
}
```

**为什么重要**：
- Tailwind v4 使用 CSS-first 配置
- 所有主题颜色和变量都在 CSS 中定义
- 不需要单独的 `tailwind.config.js` 文件

---

## 🔧 动画依赖层次结构

```
┌─────────────────────────────────────────┐
│          MACMAA 网站动画系统             │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐     ┌───────▼────────┐
│  Motion 动画    │     │  CSS 动画      │
│ (需要 npm 包)   │     │ (纯 CSS)       │
└────────────────┘     └────────────────┘
        │                       │
        ├─ 页面加载动画           ├─ Shimmer 效果
        ├─ 卡片悬停动画           └─ 其他 CSS transitions
        ├─ 轮播图过渡
        ├─ 菜单滑动
        └─ 列表渐进加载
```

---

## 🐛 常见问题诊断

### **问题 1：完全没有动画**

**可能原因**：
- ❌ `package.json` 中缺少 `motion` 依赖
- ❌ Vercel 构建时 npm install 失败

**解决方案**：
1. 检查 `package.json` 是否包含 `"motion": "^10.18.0"`
2. 查看 Vercel 构建日志，确认 npm install 成功
3. 重新部署

**验证方式**：
```bash
# 本地测试
npm install
npm run build
npm run preview
```

---

### **问题 2：有 Motion 动画，但骨架屏不闪烁**

**可能原因**：
- ❌ `/styles/globals.css` 没有被导入
- ❌ `animate-shimmer` 类定义丢失

**解决方案**：
1. 确认 `App.tsx` 中有 `import './styles/globals.css'`
2. 检查 `/styles/globals.css` 中是否有 `@keyframes shimmer` 定义
3. 确认骨架屏组件使用了 `animate-shimmer` 类

**验证方式**：
打开浏览器开发者工具 (F12)：
```
Elements → 选择骨架屏元素 → 查看 Computed 样式
应该看到：animation: shimmer 2s infinite
```

---

### **问题 3：卡片悬停没有动画**

**可能原因**：
- ❌ Motion 库未安装
- ❌ `whileHover` 属性没有应用

**解决方案**：
1. 确认组件使用了 `<motion.div>` 而不是 `<div>`
2. 确认有 `whileHover={{ y: -8 }}` 属性
3. 检查浏览器控制台是否有错误

---

### **问题 4：页面加载没有淡入效果**

**可能原因**：
- ❌ Motion 库未安装
- ❌ `initial` 和 `animate` 属性没有应用

**解决方案**：
1. 确认使用了正确的 Motion 导入：`import { motion } from 'motion/react'`
2. 确认有完整的动画属性：
   ```tsx
   initial={{ opacity: 0, y: 20 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.6 }}
   ```

---

## 📊 性能优化建议

### **1. 动画性能**

✅ **已优化**：
- 使用 `transform` 而不是 `top/left`（GPU 加速）
- 使用 `opacity` 过渡（高效）
- 避免触发 layout reflow

❌ **避免**：
- 不要同时动画化太多元素
- 不要在动画中改变 `width/height`
- 不要过度使用 `box-shadow` 动画

---

### **2. 懒加载动画**

✅ **已实现**：
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}  // ← 只动画一次
>
```

**好处**：
- 元素进入视口时才触发动画
- 提升初始加载性能
- 减少不必要的重新渲染

---

### **3. Shimmer 动画优化**

✅ **已优化**：
```css
.animate-shimmer {
  animation: shimmer 2s infinite;
  /* 使用 background-position 而不是 transform */
  /* GPU 加速 */
}
```

---

## 📦 完整的依赖清单

### **动画相关的 npm 包：**

```json
{
  "dependencies": {
    "motion": "^10.18.0",           // Motion 动画库
    "react": "^18.3.1",             // React 基础库
    "react-dom": "^18.3.1",         // React DOM
    "lucide-react": "^0.344.0"      // 图标库（用于动画的图标）
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",        // Tailwind CSS v4
    "vite": "^5.2.8"                // 构建工具
  }
}
```

### **动画相关的文件：**

```
your-project/
├── styles/
│   └── globals.css              ← 自定义动画定义
├── components/
│   ├── SkeletonCard.tsx         ← 使用 shimmer 动画
│   ├── NewsSkeleton.tsx         ← 骨架屏组件
│   └── EventSkeleton.tsx        ← 骨架屏组件
├── pages/
│   ├── Home.tsx                 ← Motion 页面动画
│   ├── NewsList.tsx             ← Motion 列表动画
│   └── EventList.tsx            ← Motion 列表动画
└── App.tsx                      ← 导入 globals.css
```

---

## ✅ 部署前检查清单

部署到 Vercel 之前，确认：

- [ ] `package.json` 包含 `"motion": "^10.18.0"`
- [ ] `App.tsx` 导入了 `./styles/globals.css`
- [ ] `/styles/globals.css` 包含 `@keyframes shimmer` 定义
- [ ] 本地运行 `npm run build` 成功
- [ ] 本地运行 `npm run preview` 可以看到动画
- [ ] 浏览器控制台没有 Motion 相关错误
- [ ] 骨架屏组件使用了 `animate-shimmer` 类

---

## 🎯 测试动画的方法

### **本地测试：**

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（热重载）
npm run dev

# 3. 构建生产版本
npm run build

# 4. 预览生产版本
npm run preview
```

### **浏览器测试：**

1. **打开开发者工具** (F12)
2. **Performance 标签**：
   - 录制页面加载
   - 查看动画帧率（应该 60fps）
3. **Console 标签**：
   - 检查是否有错误
   - 特别注意 Motion 相关错误
4. **Elements 标签**：
   - 选择骨架屏元素
   - 查看 Computed 样式
   - 确认 `animation` 属性存在

---

## 🔍 Vercel 部署后验证

部署成功后，在生产环境测试：

### **1. 基础功能测试**

| 页面 | 测试项 | 预期效果 |
|------|--------|---------|
| 首页 | 页面加载 | 元素从下方淡入 |
| 首页 | 轮播图 | 1秒平滑过渡 |
| 首页 | 服务卡片悬停 | 向上浮动 8px |
| 新闻列表 | 页面加载 | 骨架屏闪烁 800ms |
| 新闻列表 | 卡片悬停 | 向上浮动 8px |
| 活动列表 | 页面加载 | 骨架屏闪烁 800ms |
| 移动端 | 菜单按钮 | 菜单滑入/滑出 |

### **2. 性能测试**

使用 **Lighthouse** (Chrome DevTools)：

```
Performance 分数应该 > 90
First Contentful Paint < 1.5s
Largest Contentful Paint < 2.5s
Cumulative Layout Shift < 0.1
```

### **3. 兼容性测试**

测试以下浏览器：
- ✅ Chrome (最新版)
- ✅ Firefox (最新版)
- ✅ Safari (最新版)
- ✅ Edge (最新版)
- ✅ 移动端 Safari (iOS)
- ✅ 移动端 Chrome (Android)

---

## 💡 最佳实践

### **✅ 推荐做法**

1. **使用 Motion 的 viewport once**：
   ```tsx
   viewport={{ once: true }}  // 只动画一次
   ```

2. **使用合理的 duration**：
   - 快速交互：0.2-0.3s
   - 页面元素：0.4-0.6s
   - 轮播图：1-1.5s

3. **使用 GPU 加速属性**：
   - ✅ `transform`、`opacity`
   - ❌ `width`、`height`、`top`、`left`

### **❌ 避免做法**

1. **不要过度动画**：
   - 不要让所有元素都动
   - 保持简洁专业

2. **不要使用过长的 duration**：
   - 用户会感到不耐烦
   - 建议最长 1.5s

3. **不要在动画中改变布局**：
   - 会导致 Layout Shift
   - 影响 SEO 和用户体验

---

## 📚 相关资源

### **官方文档**

- **Motion 文档**：https://motion.dev/docs/react-quick-start
- **Tailwind CSS v4**：https://tailwindcss.com/docs
- **Vite 文档**：https://vitejs.dev/

### **动画灵感**

- **Dribbble**：https://dribbble.com/tags/web_animation
- **CodePen**：https://codepen.io/tag/animation
- **Awwwards**：https://www.awwwards.com/

---

## 🎓 总结

### **MACMAA 网站使用了两层动画系统：**

1. **Motion 层** (需要 npm 包)
   - 页面过渡动画
   - 交互动画
   - 悬停效果

2. **CSS 层** (纯 CSS)
   - Shimmer 效果
   - 简单过渡

### **Vercel 部署关键点：**

✅ **必须有**：`package.json` 中的 `motion` 依赖  
✅ **必须导入**：`App.tsx` 中的 `./styles/globals.css`  
✅ **必须检查**：Vercel 构建日志确认安装成功

按照以上指南，您的 Vercel 部署应该和 Figma Make 预览完全一致！🎉

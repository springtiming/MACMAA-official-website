# VMCA 网站原型文档 / VMCA Website Prototype Documentation

## 项目概述 / Project Overview

这是维多利亚多元文化社区促进协会（VMCA）的可交互式网站原型，用于验证核心业务流程和技术方案。

This is an interactive website prototype for the Victoria Multicultural Community Promotion Association (VMCA) to validate core business processes and technical solutions.

---

## 技术栈 / Tech Stack

- **前端框架**: React 18 + TypeScript
- **样式方案**: Tailwind CSS v4.0
- **动画库**: Motion (Framer Motion)
- **图标库**: Lucide React
- **路由**: React Router v6
- **图片来源**: Unsplash (原型阶段使用占位图)

---

## 核心功能模块 / Core Features

### 1. 多语言切换 / Language Switching
- 自动检测浏览器语言（中文/英文）
- 右上角语言切换按钮
- 所有页面内容实时切换
- 位置：Header 组件

**测试路径**: 点击右上角地球图标按钮

---

### 2. 首页 / Home Page
**路径**: `/`

**功能**:
- Hero 区域：协会介绍 + CTA 按钮
- 服务展示：文化活动、教育培训、社区支持
- 会员招募 CTA 区域
- 装饰性动画元素

**技术亮点**:
- Motion 动画：淡入、上滑、悬停效果
- 渐变背景与装饰性元素动画
- 响应式网格布局

---

### 3. 新闻动态 / News

#### 3.1 新闻列表 / News List
**路径**: `/news`

**功能**:
- 卡片式新闻列表
- 显示标题、摘要、日期、封面图
- 悬停卡片上升动画
- 阅读更多按钮

#### 3.2 新闻详情 / News Detail
**路径**: `/news/:id`

**功能**:
- 完整新闻内容展示
- 返回列表按钮
- 分享按钮（占位）
- 相关推荐区域

**API 对接说明**:
```
GET /api/news - 获取新闻列表
GET /api/news/:id - 获取新闻详情
后台 CMS 管理发布
```

---

### 4. 活动中心 / Events

#### 4.1 活动列表 / Event List
**路径**: `/events`

**功能**:
- 双列活动卡片展示
- 显示时间、地点、费用、名额
- "即将举行"标签
- 立即报名按钮

#### 4.2 活动详情 / Event Detail
**路径**: `/events/:id`

**功能**:
- 活动详细信息
- 时间、地点、费用、名额信息卡片
- 名额紧张提示（剩余≤10）
- 报名 CTA 按钮

#### 4.3 活动报名流程 / Event Registration
**路径**: `/events/:id/register`

**功能**:
- **步骤 1**: 填写报名表单（姓名、邮箱、电话、人数、备注）
- **步骤 2**: 选择支付方式（在线支付/现场支付/银行转账）
- **步骤 3**: 提交成功页面
- 进度条指示器

**支付集成说明**:
```
实际系统将集成：
- Stripe / PayPal 支付网关
- 支付完成后触发确认邮件
- 报名数据存入数据库
- 管理员后台可查看报名统计
```

---

### 5. 会员申请 / Membership

**路径**: `/membership`

**功能**:
- 会员权益展示（优先报名、费用优惠、社区网络）
- 会员申请表单
  - 基本信息：姓名、邮箱、电话、地址
  - 文化背景
  - 感兴趣的服务
  - 是否愿意做志愿者
- 提交成功页面

**后台处理流程**:
```
1. 表单提交至后台 API
2. 数据存入待审核列表
3. 发送确认邮件给申请人
4. 管理员在后台审核
5. 审核通过后发送欢迎邮件
```

---

### 6. 后台管理 / Admin Panel

#### 6.1 管理员登录 / Admin Login
**路径**: `/admin`

**测试账号**:
- 用户名: `admin`
- 密码: `demo123`

**功能**:
- 登录表单
- 错误提示
- Session 认证（sessionStorage）

#### 6.2 管理仪表盘 / Admin Dashboard
**路径**: `/admin/dashboard`

**功能**:
- 数据统计卡片：
  - 活动总数
  - 新闻总数
  - 待审核会员
  - 最新报名
- 管理模块入口：
  - 活动管理
  - 新闻管理
  - 会员审核
  - 账号设置
- 最近活动时间线
- 退出登录

**系统集成说明**:
```
后台功能将包括：
- 富文本编辑器（TinyMCE / Quill）
- 图片上传管理
- 用户角色权限系统
- 数据导出（CSV/Excel）
- 邮件通知配置
```

---

## 设计规范 / Design Guidelines

### 色彩系统 / Color Palette
- **主色**: #2B5F9E (藏青蓝)
- **辅色 1**: #6BA868 (浅绿)
- **辅色 2**: #EB8C3A (暖橙)
- **背景**: #F5EFE6 (暖米黄)
- **强调背景**: #E8DCC8

### 动画规范 / Animation Guidelines
- **按钮 Hover**: scale(1.02-1.05)
- **卡片 Hover**: 上移 -4px 到 -8px
- **页面入场**: fadeIn + slideUp
- **过渡时间**: 0.2s - 0.6s
- **缓动函数**: easeInOut

### 响应式断点 / Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 文件结构 / File Structure

```
/
├── App.tsx                      # 主应用 + 路由
├── contexts/
│   └── LanguageContext.tsx      # 语言切换上下文
├── components/
│   ├── Header.tsx               # 导航栏
│   └── Footer.tsx               # 页脚
├── pages/
│   ├── Home.tsx                 # 首页
│   ├── NewsList.tsx             # 新闻列表
│   ├── NewsDetail.tsx           # 新闻详情
│   ├── EventList.tsx            # 活动列表
│   ├── EventDetail.tsx          # 活动详情
│   ├── EventRegistration.tsx    # 活动报名
│   ├── Membership.tsx           # 会员申请
│   ├── AdminLogin.tsx           # 管理员登录
│   └── AdminDashboard.tsx       # 管理仪表盘
├── data/
│   └── mockData.ts              # 模拟数据
└── styles/
    └── globals.css              # 全局样式
```

---

## 用户体验路径 / User Journey

### 路径 1：浏览新闻
1. 访问首页 → 点击"最新动态"
2. 浏览新闻列表
3. 点击感兴趣的新闻卡片
4. 阅读详情 → 返回列表

### 路径 2：活动报名
1. 访问"活动中心"
2. 浏览活动列表
3. 点击活动查看详情
4. 点击"立即报名"
5. 填写报名表单
6. 选择支付方式
7. 查看报名成功页面

### 路径 3：会员申请
1. 首页点击"加入我们"
2. 查看会员权益
3. 填写申请表单
4. 提交申请
5. 查看成功提示

### 路径 4：后台管理
1. 访问 `/admin`
2. 使用测试账号登录
3. 查看数据统计
4. 浏览管理模块
5. 查看最近活动
6. 退出登录

---

## API 对接点标注 / API Integration Points

### 前端 API 需求

#### 1. 新闻模块
```typescript
GET    /api/news          // 获取新闻列表
GET    /api/news/:id      // 获取新闻详情
POST   /api/news          // 创建新闻（管理员）
PUT    /api/news/:id      // 更新新闻（管理员）
DELETE /api/news/:id      // 删除新闻（管理员）
```

#### 2. 活动模块
```typescript
GET    /api/events        // 获取活动列表
GET    /api/events/:id    // 获取活动详情
POST   /api/events        // 创建活动（管理员）
PUT    /api/events/:id    // 更新活动（管理员）
DELETE /api/events/:id    // 删除活动（管理员）
```

#### 3. 报名模块
```typescript
POST   /api/registrations           // 提交活动报名
GET    /api/registrations/:eventId  // 获取某活动的报名列表（管理员）
```

#### 4. 会员模块
```typescript
POST   /api/members               // 提交会员申请
GET    /api/members               // 获取会员列表（管理员）
PUT    /api/members/:id/approve   // 审核通过会员（管理员）
PUT    /api/members/:id/reject    // 审核拒绝会员（管理员）
```

#### 5. 认证模块
```typescript
POST   /api/auth/login    // 管理员登录
POST   /api/auth/logout   // 管理员登出
GET    /api/auth/verify   // 验证 Token
```

---

## 邮件通知触发点 / Email Notification Triggers

1. **活动报名成功** → 发送确认邮件（给用户）
2. **会员申请提交** → 发送确认邮件（给用户）+ 通知邮件（给管理员）
3. **会员申请审核通过** → 发送欢迎邮件（给用户）
4. **活动即将开始** → 发送提醒邮件（活动前 3 天）
5. **活动取消/变更** → 发送通知邮件（给已报名用户）

---

## 支付集成方案 / Payment Integration

### 推荐方案
- **Stripe**: 适合国际支付，支持信用卡、借记卡
- **PayPal**: 用户认知度高，支持多种支付方式
- **银行转账**: 备选方案，需人工确认

### 集成流程
1. 用户选择支付方式
2. 前端调用支付网关 API
3. 重定向到支付页面/弹出支付窗口
4. 支付完成后回调通知后端
5. 后端验证支付状态
6. 更新报名状态 + 发送确认邮件

---

## 性能优化建议 / Performance Optimization

1. **图片优化**:
   - 使用 WebP 格式
   - 实现懒加载
   - 使用 CDN 托管

2. **代码分割**:
   - React.lazy() 懒加载路由组件
   - 动态导入大型库

3. **缓存策略**:
   - 浏览器缓存静态资源
   - API 响应缓存（SWR / React Query）

4. **SEO 优化**:
   - 使用 Next.js 实现 SSR
   - 添加 meta 标签
   - 生成 sitemap

---

## 安全考虑 / Security Considerations

1. **数据保护**:
   - HTTPS 加密传输
   - 不在前端存储敏感信息
   - 使用 JWT 进行认证

2. **表单验证**:
   - 前端基础验证
   - 后端严格验证
   - 防止 XSS 和 SQL 注入

3. **隐私合规**:
   - 明确隐私政策
   - 数据最小化收集
   - 用户同意机制

---

## 下一步开发计划 / Next Steps

### 优先级 1（MVP）
- [ ] 搭建后端 API（Node.js / Django）
- [ ] 连接数据库（PostgreSQL / MongoDB）
- [ ] 实现用户认证系统
- [ ] 集成邮件服务（SendGrid / AWS SES）
- [ ] 部署测试环境

### 优先级 2（增强功能）
- [ ] 集成支付网关
- [ ] 实现富文本编辑器
- [ ] 添加图片上传功能
- [ ] 实现搜索功能
- [ ] 添加数据导出功能

### 优先级 3（优化）
- [ ] 性能优化
- [ ] SEO 优化
- [ ] 多端测试（iOS / Android）
- [ ] 无障碍访问优化
- [ ] 添加单元测试

---

## 反馈收集 / Feedback Collection

请在测试原型后提供以下反馈：

1. **用户体验**:
   - 导航是否清晰？
   - 操作流程是否顺畅？
   - 语言切换是否自然？

2. **视觉设计**:
   - 色彩搭配是否合适？
   - 动画效果是否过度？
   - 字体大小是否合适？

3. **功能需求**:
   - 是否缺少关键功能？
   - 哪些功能需要优先实现？
   - 是否需要调整业务流程？

---

## 联系方式 / Contact

如有任何问题或建议，请联系项目团队。

---

**原型版本**: v1.0  
**最后更新**: 2025-11-25  
**状态**: 待评审反馈

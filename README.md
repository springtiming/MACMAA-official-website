# MACMAA 官方网站

[English](./README_en.md)

## 项目概览

MACMAA 官方网站是澳洲万年市华人互助会的线上门户仓库，用于承载对外展示页面、社区服务流程和后台管理能力。项目基于 Next.js 与 TypeScript 构建，覆盖新闻发布、活动报名、会员申请、志愿者管理以及管理后台等核心场景，并兼顾双语内容展示与 SEO 需求。

## 核心能力

- 中英文双语界面与内容呈现
- 新闻列表、详情页与后台新闻管理
- 活动展示、活动详情、在线报名与支付审核
- 会员申请、会员验证码校验与会员权益相关逻辑
- 志愿者申请流程与后台审核支持
- 管理后台模块，覆盖账号、新闻、活动、会员、志愿者与站点设置
- SEO 相关配置、站点地图与面向生产的预渲染能力

## 技术栈

- **应用框架**: Next.js 14, React 18, TypeScript
- **界面系统**: Tailwind CSS, Radix UI, 自定义组件体系
- **交互与动画**: Framer Motion
- **后端集成**: Supabase
- **支付与通知**: Stripe, Resend
- **部署方式**: Vercel

## 项目结构

```text
.
|-- public/              静态资源与站点公开文件
|-- src/
|   |-- components/      通用组件与 UI 组件
|   |-- config/          站点级配置
|   |-- contexts/        语言与全局上下文
|   |-- features/        业务模块
|   |-- lib/             客户端工具函数与共享逻辑
|   |-- pages/           Next.js 页面与 API 路由
|   `-- server/          服务端辅助逻辑
|-- supabase/            Supabase 配置与数据库迁移
|-- vercel.json          部署与本地函数调试配置
`-- README_en.md         英文说明
```

## 本地开发

### 环境要求

- Node.js
- npm
- 项目所需环境变量，建议放在根目录 `.env.local`
- 变量说明与平台配置位置见 [`docs/环境变量配置说明.md`](./docs/环境变量配置说明.md)

### 安装与启动

```bash
npm install
npm run dev
```

默认开发服务器由 Next.js 提供。如需通过 Vercel 本地模拟服务端能力，可运行：

```bash
npm run dev:api
```

## 常用脚本

```bash
# 启动开发环境
npm run dev

# 本地模拟 Vercel 环境
npm run dev:api

# 构建生产版本
npm run build

# 启动生产构建
npm run start

# 代码质量检查
npm run lint
npm run type-check
npm run test
npm run check
```

## 质量保障

仓库内已配置面向前端与服务端辅助逻辑的自动化测试，并提供基础静态检查能力：

- `npm run test`: 运行 Vitest 测试套件
- `npm run lint`: 执行 ESLint 检查
- `npm run type-check`: 执行 TypeScript 类型检查
- `npm run check`: 汇总代码风格、静态检查与类型检查

## 部署说明

- 生产部署目标为 Vercel
- 项目包含 `vercel.json` 以及面向 Supabase 的配置与迁移目录
- 在启用完整业务链路前，应先完成 Vercel 与 Supabase Secrets 的变量配置
- 推荐从 `env.template` 复制生成本地 `.env.local`
- 详细变量清单见 [`docs/环境变量配置说明.md`](./docs/环境变量配置说明.md)

## 资源授权与许可证

### 代码许可证

源代码遵循 [MIT License](./LICENSE)。

### 客户资产声明

仓库中的文本、图片、标识与设计素材归澳洲万年市华人互助会所有。除非获得明确授权，这些资产不得复用、再分发或用于其他项目。

### 使用授权说明

本仓库已获澳洲万年市华人互助会许可，用于官方网站建设与作品集展示。

## 项目状态

该仓库处于持续维护状态，面向真实社区网站场景，包含公开站点功能与内部管理能力。

# API 测试说明

## 目录结构

```
api/__tests__/
├── email/                    # 邮件功能测试
│   ├── emailService.test.ts  # 邮件服务核心功能测试
│   └── env-check.test.ts     # 环境变量检查测试
├── helpers/                  # 测试辅助函数
│   └── test-utils.ts         # 通用测试工具函数
└── README.md                 # 本文件
```

## 运行测试

### 运行所有测试
```bash
npm test
```

### 运行特定测试文件
```bash
npm test -- api/__tests__/email/emailService.test.ts
```

### 运行特定测试套件
```bash
npm test -- api/__tests__/email
```

### 监视模式（开发时使用）
```bash
npm test -- --watch
```

## 测试文件组织原则

1. **按功能模块分组**：每个功能模块有自己的测试文件夹
2. **测试文件命名**：使用 `.test.ts` 后缀
3. **辅助函数**：放在 `helpers/` 目录下，供多个测试文件复用

## 添加新测试

1. 确定测试所属的功能模块
2. 在对应的模块文件夹中创建测试文件
3. 如需共享的辅助函数，添加到 `helpers/` 目录

## 测试最佳实践

1. **使用描述性的测试名称**：清楚说明测试的内容
2. **每个测试只测试一个功能点**
3. **使用 Mock 避免外部依赖**：如邮件服务、数据库等
4. **清理测试环境**：使用 `beforeEach` 和 `afterEach` 重置状态





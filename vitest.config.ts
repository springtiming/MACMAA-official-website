import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "path";

export default defineConfig(({ mode }) => {
  // 加载环境变量文件
  // 优先级：.env.local > .env.[mode].local > .env.[mode] > .env
  // mode 默认为 'test'，但也会加载 .env.local
  const env = loadEnv(mode, process.cwd(), "");
  
  // 将环境变量注入到 process.env（仅在未设置时）
  // 这样 .env.local 中的值会覆盖默认值，但不会覆盖已存在的环境变量
  Object.keys(env).forEach((key) => {
    if (process.env[key] === undefined) {
      process.env[key] = env[key];
    }
  });
  
  return {
    test: {
      globals: true,
      environment: "node",
      include: ["**/__tests__/**/*.{test,spec}.{ts,tsx}", "**/*.{test,spec}.{ts,tsx}"],
      exclude: ["node_modules", "dist", ".vercel", "**/__tests__/**/helpers/**"],
      // 确保测试能访问环境变量
      env: env,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});






import { variantConfig, type InkBackgroundProps } from "./types";

/**
 * 水墨晕染背景组件
 * 创建中国传统水墨风格的渐变背景效果
 */
export function InkBackground({ variant = "brand" }: InkBackgroundProps) {
  const config = variantConfig[variant];

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ opacity: config.inkOpacity }}
    >
      {/* 顶部水墨晕染 */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "-128px",
          width: "800px",
          height: "400px",
          borderRadius: "50%",
          filter: "blur(80px)",
          background: `radial-gradient(ellipse at center, ${config.accent}40 0%, transparent 70%)`,
        }}
      />

      {/* 底部水墨晕染 */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-128px",
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          filter: "blur(80px)",
          background: `radial-gradient(ellipse at center, ${config.accent}33 0%, transparent 70%)`,
        }}
      />

      {/* 左侧装饰 */}
      <div
        className="absolute top-1/3 -translate-y-1/2"
        style={{
          left: "-100px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          filter: "blur(60px)",
          background: `radial-gradient(ellipse at center, ${config.accent}20 0%, transparent 70%)`,
        }}
      />

      {/* 右侧装饰 */}
      <div
        className="absolute top-2/3 -translate-y-1/2"
        style={{
          right: "-100px",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          filter: "blur(60px)",
          background: `radial-gradient(ellipse at center, ${config.accent}20 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

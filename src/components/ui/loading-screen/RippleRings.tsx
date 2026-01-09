import { motion } from "motion/react";
import type { RippleRingsProps } from "./types";

/**
 * 扩散圆环动画组件
 * 从中心向外扩散的水墨涟漪效果
 */
export function RippleRings({
  color = "rgba(43, 95, 158, 0.2)",
  count = 2,
  size = 400,
  duration = 3,
}: RippleRingsProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            border: `1px solid ${color}`,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.5, opacity: [0, 0.6, 0] }}
          transition={{
            duration,
            ease: "easeOut",
            repeat: Infinity,
            delay: index * (duration / count),
          }}
        />
      ))}
    </div>
  );
}

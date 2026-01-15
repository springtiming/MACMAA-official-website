import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "./utils";

export interface NotificationBadgeProps
  extends Omit<HTMLMotionProps<"span">, "children"> {
  count: number;
  showZero?: boolean;
  pulse?: boolean;
}

export function NotificationBadge({
  count,
  showZero = false,
  pulse = true,
  className,
  style,
  ...props
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) return null;

  const displayCount = count > 99 ? "99+" : String(count);
  const sizeClass =
    displayCount.length === 1
      ? "size-5"
      : displayCount.length === 2
        ? "size-6"
        : "size-7";
  const fontClass = displayCount.length >= 3 ? "text-[10px]" : "text-xs";

  return (
    <motion.span
      data-slot="notification-badge"
      className={cn(
        "absolute top-2 right-2 inline-flex items-center justify-center rounded-full font-bold text-white border-2 border-white pointer-events-none select-none leading-none",
        sizeClass,
        fontClass,
        className
      )}
      style={{
        background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
        ...style,
      }}
      animate={pulse ? { scale: [1, 1.08, 1] } : undefined}
      transition={
        pulse
          ? {
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }
          : undefined
      }
      {...props}
    >
      {displayCount}
    </motion.span>
  );
}

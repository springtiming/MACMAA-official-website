import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "./utils";

export type NotificationBadgeVariant = "simple" | "raised";
export type NotificationBadgeTone = "red" | "blue" | "green" | "orange";
export type NotificationBadgeSize = "auto" | "sm" | "md" | "lg";
export type NotificationBadgePlacement = "inside" | "outside";
export type NotificationBadgeShape = "circle" | "pill";

const SIMPLE_TONES: Record<
  NotificationBadgeTone,
  { from: string; to: string; glow: string }
> = {
  red: {
    from: "#ef4444",
    to: "#dc2626",
    glow: "rgba(239, 68, 68, 0.5)",
  },
  blue: {
    from: "#3b82f6",
    to: "#2563eb",
    glow: "rgba(59, 130, 246, 0.5)",
  },
  green: {
    from: "#22c55e",
    to: "#16a34a",
    glow: "rgba(34, 197, 94, 0.5)",
  },
  orange: {
    from: "#f97316",
    to: "#ea580c",
    glow: "rgba(249, 115, 22, 0.5)",
  },
};

const RAISED_TONES: Record<
  NotificationBadgeTone,
  {
    from: string;
    via: string;
    to: string;
    hoverFrom: string;
    hoverVia: string;
    hoverTo: string;
    shadow: string;
    hoverShadow: string;
    pulseShadow: string;
  }
> = {
  red: {
    from: "#ef4444",
    via: "#dc2626",
    to: "#b91c1c",
    hoverFrom: "#dc2626",
    hoverVia: "#b91c1c",
    hoverTo: "#991b1b",
    shadow:
      "0 4px 14px rgba(220, 38, 38, 0.6), 0 2px 8px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    hoverShadow:
      "0 6px 18px rgba(220, 38, 38, 0.7), 0 3px 10px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    pulseShadow:
      "0 6px 20px rgba(220, 38, 38, 0.8), 0 3px 12px rgba(239, 68, 68, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  },
  blue: {
    from: "#3b82f6",
    via: "#2563eb",
    to: "#1d4ed8",
    hoverFrom: "#2563eb",
    hoverVia: "#1d4ed8",
    hoverTo: "#1e40af",
    shadow:
      "0 4px 14px rgba(37, 99, 235, 0.6), 0 2px 8px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    hoverShadow:
      "0 6px 18px rgba(37, 99, 235, 0.7), 0 3px 10px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    pulseShadow:
      "0 6px 20px rgba(37, 99, 235, 0.8), 0 3px 12px rgba(59, 130, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  },
  green: {
    from: "#22c55e",
    via: "#16a34a",
    to: "#15803d",
    hoverFrom: "#16a34a",
    hoverVia: "#15803d",
    hoverTo: "#166534",
    shadow:
      "0 4px 14px rgba(22, 163, 74, 0.6), 0 2px 8px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    hoverShadow:
      "0 6px 18px rgba(22, 163, 74, 0.7), 0 3px 10px rgba(34, 197, 94, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    pulseShadow:
      "0 6px 20px rgba(22, 163, 74, 0.8), 0 3px 12px rgba(34, 197, 94, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  },
  orange: {
    from: "#f97316",
    via: "#ea580c",
    to: "#c2410c",
    hoverFrom: "#ea580c",
    hoverVia: "#c2410c",
    hoverTo: "#9a3412",
    shadow:
      "0 4px 14px rgba(234, 88, 12, 0.6), 0 2px 8px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    hoverShadow:
      "0 6px 18px rgba(234, 88, 12, 0.7), 0 3px 10px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
    pulseShadow:
      "0 6px 20px rgba(234, 88, 12, 0.8), 0 3px 12px rgba(249, 115, 22, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
  },
};

function toTailwindArbitraryValue(value: string) {
  return value.replace(/ /g, "_");
}

export interface NotificationBadgeProps
  extends Omit<HTMLMotionProps<"span">, "children"> {
  count: number;
  showZero?: boolean;
  pulse?: boolean;
  max?: number;
  variant?: NotificationBadgeVariant;
  tone?: NotificationBadgeTone;
  size?: NotificationBadgeSize;
  placement?: NotificationBadgePlacement;
  shape?: NotificationBadgeShape;
}

export function NotificationBadge({
  count,
  showZero = false,
  pulse = true,
  max = 99,
  variant = "simple",
  tone = "red",
  size = "auto",
  placement = "inside",
  shape = "circle",
  className,
  style,
  ...props
}: NotificationBadgeProps) {
  const safeCount =
    Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  if (safeCount === 0 && !showZero) return null;

  const displayCount = safeCount > max ? `${max}+` : String(safeCount);
  const countLength = Math.min(displayCount.length, 3);
  const circleSizeClass = (() => {
    if (variant === "raised") {
      if (size !== "auto") {
        if (size === "sm") return "size-6";
        if (size === "lg") return "size-10";
        return "size-8";
      }
      if (countLength === 1) return "size-6";
      if (countLength === 2) return "size-8";
      return "size-10";
    }

    if (size !== "auto") {
      if (size === "sm") return "size-5";
      if (size === "lg") return "size-7";
      return "size-6";
    }
    if (countLength === 1) return "size-5";
    if (countLength === 2) return "size-6";
    return "size-7";
  })();

  const pillSizeClass = (() => {
    if (variant === "raised") {
      if (size === "sm") return "h-6 min-w-6 px-2";
      if (size === "lg") return "h-10 min-w-10 px-3";
      if (size === "auto") {
        if (countLength === 1) return "h-6 min-w-6 px-2";
        if (countLength === 2) return "h-8 min-w-8 px-2.5";
        return "h-10 min-w-10 px-3";
      }
      return "h-8 min-w-8 px-2.5";
    }

    return "h-[22px] min-w-[22px] px-[0.3rem]";
  })();

  const fontClass = (() => {
    if (variant === "raised") {
      const requestedSize = size === "auto" ? undefined : size;
      const resolvedSize =
        requestedSize ??
        (countLength === 1 ? "sm" : countLength === 2 ? "md" : "lg");
      if (resolvedSize === "sm") return countLength >= 3 ? "text-[10px]" : "text-[11px]";
      if (resolvedSize === "lg") return countLength >= 3 ? "text-[13px]" : "text-[15px]";
      return countLength >= 3 ? "text-[11px]" : "text-[13px]";
    }

    return countLength >= 3
      ? "text-[0.55rem] sm:text-[0.6rem]"
      : "text-[0.6rem] sm:text-[0.65rem]";
  })();

  const positionClass =
    placement === "outside"
      ? variant === "raised"
        ? "-top-2 -right-2"
        : "-top-[0.3rem] -right-[0.3rem] sm:-top-1.5 sm:-right-1.5"
      : "top-2 right-2";

  const sizeClass = shape === "pill" ? pillSizeClass : circleSizeClass;
  const raisedVariableClasses =
    variant === "raised"
      ? cn(
          toTailwindArbitraryValue(`[--nb-from:${RAISED_TONES[tone].from}]`),
          toTailwindArbitraryValue(`[--nb-via:${RAISED_TONES[tone].via}]`),
          toTailwindArbitraryValue(`[--nb-to:${RAISED_TONES[tone].to}]`),
          toTailwindArbitraryValue(`[--nb-shadow:${RAISED_TONES[tone].shadow}]`),
          toTailwindArbitraryValue(
            `group-hover:[--nb-from:${RAISED_TONES[tone].hoverFrom}]`
          ),
          toTailwindArbitraryValue(
            `group-hover:[--nb-via:${RAISED_TONES[tone].hoverVia}]`
          ),
          toTailwindArbitraryValue(
            `group-hover:[--nb-to:${RAISED_TONES[tone].hoverTo}]`
          ),
          toTailwindArbitraryValue(
            `group-hover:[--nb-shadow:${RAISED_TONES[tone].hoverShadow}]`
          )
        )
      : null;

  return (
    <motion.span
      data-slot="notification-badge"
      className={cn(
        "absolute z-10 inline-flex items-center justify-center rounded-full text-white pointer-events-none select-none leading-none",
        positionClass,
        sizeClass,
        variant === "raised" ? "font-semibold" : "font-bold",
        fontClass,
        variant === "raised"
          ? "before:content-[''] before:absolute before:top-[2px] before:left-1/2 before:-translate-x-1/2 before:w-[75%] before:h-[4px] before:rounded-full before:bg-gradient-to-b before:from-white/40 before:to-transparent before:blur-[1px] before:pointer-events-none"
          : null,
        raisedVariableClasses,
        className
      )}
      style={{
        ...(variant === "raised"
          ? {
              background:
                "linear-gradient(to bottom right, var(--nb-from), var(--nb-via), var(--nb-to))",
              boxShadow: "var(--nb-shadow)",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
            }
          : {
              background: `linear-gradient(135deg, ${SIMPLE_TONES[tone].from}, ${SIMPLE_TONES[tone].to})`,
              boxShadow: `0 0 0 2px white, 0 2px 8px ${SIMPLE_TONES[tone].glow}`,
            }),
        ...style,
      }}
      animate={
        pulse
          ? variant === "raised"
            ? {
                boxShadow: [
                  RAISED_TONES[tone].shadow,
                  RAISED_TONES[tone].pulseShadow,
                  RAISED_TONES[tone].shadow,
                ],
              }
            : {
                scale: [1, 1.05, 1],
                opacity: [1, 0.9, 1],
              }
          : undefined
      }
      transition={
        pulse
          ? {
              duration: 2,
              ease: [0.4, 0, 0.6, 1],
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

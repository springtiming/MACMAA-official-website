import { useEffect, useState } from "react";

/**
 * 视差滚动Hook - 返回滚动偏移量
 * @param speed - 视差速度因子（0.5 = 慢一半，2 = 快一倍）
 */
export function useParallax(speed: number = 0.5) {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return offsetY;
}

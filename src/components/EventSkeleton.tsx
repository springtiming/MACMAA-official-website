import { SkeletonCard } from './SkeletonCard';

/**
 * 活动页面骨架屏组件
 * 显示多个活动卡片的加载占位
 */

interface EventSkeletonProps {
  count?: number;
}

export function EventSkeleton({ count = 4 }: EventSkeletonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant="event" />
      ))}
    </div>
  );
}

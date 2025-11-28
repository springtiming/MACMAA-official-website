import { SkeletonCard } from './SkeletonCard';

/**
 * 新闻页面骨架屏组件
 * 显示多个新闻卡片的加载占位
 */

interface NewsSkeletonProps {
  count?: number;
}

export function NewsSkeleton({ count = 6 }: NewsSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant="news" />
      ))}
    </div>
  );
}

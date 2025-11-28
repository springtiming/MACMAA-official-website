/**
 * 通用骨架屏卡片组件
 * 提供脉动动画效果，用于内容加载时的占位显示
 */

interface SkeletonCardProps {
  variant?: 'news' | 'event';
  className?: string;
}

export function SkeletonCard({ variant = 'news', className = '' }: SkeletonCardProps) {
  if (variant === 'event') {
    return (
      <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden ${className}`}>
        <div className="md:flex animate-pulse">
          {/* 图片占位 */}
          <div className="md:w-2/5">
            <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
          </div>
          
          {/* 内容占位 */}
          <div className="md:w-3/5 p-4 sm:p-6 flex flex-col">
            {/* 标签占位 */}
            <div className="mb-2 flex items-center gap-2">
              <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
              <div className="h-6 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full animate-shimmer" />
            </div>
            
            {/* 标题占位 */}
            <div className="h-7 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded mb-3 animate-shimmer" />
            
            {/* 描述占位 */}
            <div className="space-y-2 mb-4 flex-1">
              <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-4 w-5/6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            </div>
            
            {/* 信息列表占位 */}
            <div className="space-y-2 mb-4">
              <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-4 w-1/2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-4 w-3/5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
              <div className="h-4 w-1/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            </div>
            
            {/* 按钮占位 */}
            <div className="h-12 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // 新闻卡片骨架屏
  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex flex-col ${className}`}>
      <div className="animate-pulse flex flex-col">
        {/* 图片占位 */}
        <div className="aspect-video bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
        
        {/* 内容占位 */}
        <div className="p-4 sm:p-6">
          {/* 日期占位 */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-3.5 sm:h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          </div>
          
          {/* 标题占位 - 单行 */}
          <div className="h-6 sm:h-7 w-4/5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded mb-2 sm:mb-3 animate-shimmer" />
          
          {/* 描述占位 - 2行固定 */}
          <div className="space-y-2 mb-3 sm:mb-4">
            <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          </div>
          
          {/* 链接占位 */}
          <div className="flex items-center gap-2">
            <div className="h-3.5 sm:h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
            <div className="h-3.5 sm:h-4 w-3.5 sm:w-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useParallax } from '../hooks/useParallax';

interface ParallaxBackgroundProps {
  imageUrl?: string;           // 背景图片URL
  speed?: number;              // 视差速度（默认0.3）
  overlay?: boolean;           // 是否显示遮罩层
  overlayOpacity?: number;     // 遮罩层透明度
  className?: string;
  children?: React.ReactNode;
}

export function ParallaxBackground({
  imageUrl,
  speed = 0.3,
  overlay = true,
  overlayOpacity = 0.6,
  className = '',
  children,
}: ParallaxBackgroundProps) {
  const offsetY = useParallax(speed);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 视差背景图 */}
      {imageUrl && (
        <div
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center parallax-optimized"
          style={{
            backgroundImage: `url(${imageUrl})`,
            transform: `translateY(${offsetY}px)`,
            top: '-10%',
          }}
        />
      )}
      {/* 渐变遮罩 */}
      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#F5EFE6]/90 via-[#F5EFE6]/80 to-[#F5EFE6]/90"
          style={{ opacity: overlayOpacity }}
        />
      )}
      {/* 内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}


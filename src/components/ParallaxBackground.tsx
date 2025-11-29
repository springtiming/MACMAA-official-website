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
          className="absolute inset-0 w-full h-[120%] parallax-optimized"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(${offsetY}px)`,
            top: '-10%',
          }}
        />
      )}
      {/* 虚化蒙版 - 先添加模糊效果 */}
      {overlay && (
        <>
          <div
            className="absolute inset-0 backdrop-blur-sm"
            style={{ opacity: 0.6 }}
          />
          {/* 渐变遮罩 - 再添加颜色遮罩 */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#F5EFE6] via-[#F5EFE6] to-[#F5EFE6]"
            style={{ opacity: overlayOpacity }}
          />
        </>
      )}
      {/* 内容 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}


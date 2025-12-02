import { useState, useCallback } from "react";
import { motion } from "motion/react";
import Cropper from "react-easy-crop";
import { X, Check, RotateCw } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspect?: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspect = 16 / 9,
}: ImageCropperProps) {
  const { language } = useLanguage();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const croppedImage = await getCroppedImg(
        image,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex flex-col z-50"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <h2 className="text-white text-lg sm:text-xl">
          {language === "zh" ? "剪裁图片" : "Crop Image"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 中间区域限制最大宽度，并使用 16:9 比例，避免在大屏上过于巨大难以操作 */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="relative w-full max-w-4xl aspect-video">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
          />
        </div>
      </div>

      <div className="bg-black/50 backdrop-blur-sm p-4 sm:p-6 space-y-4">
        {/* Zoom Control */}
        <div className="space-y-2">
          <label className="text-white text-sm">
            {language === "zh" ? "缩放" : "Zoom"}
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Rotation Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-white text-sm">
              {language === "zh" ? "旋转" : "Rotation"}
            </label>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              title={language === "zh" ? "旋转90度" : "Rotate 90°"}
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={createCroppedImage}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
          >
            <Check className="w-5 h-5" />
            {language === "zh" ? "确认" : "Confirm"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {language === "zh" ? "取消" : "Cancel"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Helper function to create cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Canvas is empty");
      }
      const fileUrl = URL.createObjectURL(blob);
      resolve(fileUrl);
    }, "image/jpeg");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));

    // data: / blob: 不需要 crossOrigin，避免不必要的 CORS 干扰
    if (!url.startsWith("data:") && !url.startsWith("blob:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }

    image.src = url;
  });
}

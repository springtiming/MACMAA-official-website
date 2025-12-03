import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
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

  // 当裁剪器打开时，降低 Header 的 z-index
  useEffect(() => {
    document.body.classList.add("image-upload-modal-open");
    return () => {
      document.body.classList.remove("image-upload-modal-open");
    };
  }, []);

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

  const cropperContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex flex-col"
      style={{ zIndex: 9999 }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 backdrop-blur-sm">
        <h2 className="text-white text-base sm:text-lg">
          {language === "zh" ? "剪裁图片" : "Crop Image"}
        </h2>
        <button
          onClick={onCancel}
          className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 中间区域限制最大宽度，并使用 16:9 比例，避免在大屏上过于巨大难以操作 */}
      <div className="flex-1 flex items-center justify-center px-3 py-3">
        <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden bg-black">
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

      <div className="bg-black/60 backdrop-blur-sm px-4 py-3 space-y-3">
        {/* Zoom Control */}
        <div className="space-y-1.5">
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-white text-sm">
              {language === "zh" ? "旋转" : "Rotation"}
            </label>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 text-white hover:bg-white/20 rounded-lg transition-colors"
              title={language === "zh" ? "旋转90度" : "Rotate 90°"}
            >
              <RotateCw className="w-4 h-4" />
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
        <div className="flex gap-2 pt-1.5">
          <button
            onClick={createCroppedImage}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#6BA868] text-white rounded-lg hover:bg-[#5a9157] transition-colors"
          >
            <Check className="w-4 h-4" />
            {language === "zh" ? "确认" : "Confirm"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {language === "zh" ? "取消" : "Cancel"}
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (typeof document === "undefined") {
    return cropperContent;
  }

  return createPortal(cropperContent, document.body);
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

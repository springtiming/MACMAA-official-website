import { useState } from "react";
import { motion } from "motion/react";
import { X, Upload } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { ImageCropper } from "./ImageCropper";

interface ImageUploadModalProps {
  onClose: () => void;
  onSuccess: (imageUrl: string) => void;
  aspect?: number;
}

export function ImageUploadModal({
  onClose,
  onSuccess,
  aspect = 16 / 9,
}: ImageUploadModalProps) {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    onSuccess(croppedImage);
  };

  if (selectedImage) {
    return (
      <ImageCropper
        image={selectedImage}
        onCropComplete={handleCropComplete}
        onCancel={() => setSelectedImage(null)}
        aspect={aspect}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2B5F9E] to-[#6BA868] text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl">
              {language === "zh" ? "上传图片" : "Upload Image"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? "border-[#2B5F9E] bg-blue-50"
                : "border-gray-300 hover:border-[#2B5F9E]"
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-700 mb-2">
              {language === "zh"
                ? "拖放图片到这里，或点击选择文件"
                : "Drag and drop an image here, or click to select"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {language === "zh"
                ? "支持 JPG, PNG, GIF 格式"
                : "Supports JPG, PNG, GIF formats"}
            </p>
            <label className="inline-block px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors cursor-pointer">
              <span>{language === "zh" ? "选择文件" : "Select File"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {language === "zh" ? "取消" : "Cancel"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

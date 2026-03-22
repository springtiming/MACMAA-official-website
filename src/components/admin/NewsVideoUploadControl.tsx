import { useRef } from "react";
import { Video } from "lucide-react";
import { NEWS_VIDEO_ACCEPT } from "@/lib/newsMedia";

type NewsVideoUploadControlProps = {
  disabled?: boolean;
  language: "zh" | "en";
  uploading: boolean;
  onSelectFile: (file: File) => void | Promise<void>;
};

export function NewsVideoUploadControl({
  disabled = false,
  language,
  uploading,
  onSelectFile,
}: NewsVideoUploadControlProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={NEWS_VIDEO_ACCEPT}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          void onSelectFile(file);
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#2B5F9E] hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-60"
        disabled={disabled || uploading}
      >
        <Video className="w-4 h-4" />
        <span>
          {uploading
            ? language === "zh"
              ? "上传中..."
              : "Uploading..."
            : language === "zh"
              ? "插入视频"
              : "Insert video"}
        </span>
      </button>
    </>
  );
}

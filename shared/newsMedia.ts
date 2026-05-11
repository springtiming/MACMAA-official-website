export const SUPPORTED_NEWS_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
] as const;

export const SUPPORTED_NEWS_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const NEWS_VIDEO_ACCEPT = SUPPORTED_NEWS_VIDEO_TYPES.join(",");
export const NEWS_IMAGE_ACCEPT = SUPPORTED_NEWS_IMAGE_TYPES.join(",");
export const NEWS_VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const NEWS_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

export type NewsMediaUploadState = {
  zh: boolean;
  en: boolean;
};

export function isSupportedNewsVideoType(mimeType: string) {
  return SUPPORTED_NEWS_VIDEO_TYPES.includes(
    mimeType.trim().toLowerCase() as (typeof SUPPORTED_NEWS_VIDEO_TYPES)[number]
  );
}

export function isSupportedNewsImageType(mimeType: string) {
  return SUPPORTED_NEWS_IMAGE_TYPES.includes(
    mimeType.trim().toLowerCase() as (typeof SUPPORTED_NEWS_IMAGE_TYPES)[number]
  );
}

export function hasInlineNewsDataMedia(value?: string | null) {
  if (!value) return false;
  return /data:(?:image|video)\//i.test(value);
}

export function buildNewsImageEmbedHtml(src: string) {
  return `<p><img src="${src}"></p>`;
}

export function buildNewsVideoEmbedHtml(src: string) {
  return `<p><video class="news-inline-video" controls preload="metadata" playsinline src="${src}"></video></p>`;
}

export function hasPendingNewsMediaUploads(state: NewsMediaUploadState) {
  return state.zh || state.en;
}

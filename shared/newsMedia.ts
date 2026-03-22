export const SUPPORTED_NEWS_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
] as const;

export const NEWS_VIDEO_ACCEPT = SUPPORTED_NEWS_VIDEO_TYPES.join(",");

export type NewsMediaUploadState = {
  zh: boolean;
  en: boolean;
};

export function isSupportedNewsVideoType(mimeType: string) {
  return SUPPORTED_NEWS_VIDEO_TYPES.includes(
    mimeType.trim().toLowerCase() as (typeof SUPPORTED_NEWS_VIDEO_TYPES)[number]
  );
}

export function buildNewsVideoEmbedHtml(src: string) {
  return `<p><video class="news-inline-video" controls preload="metadata" playsinline src="${src}"></video></p>`;
}

export function hasPendingNewsMediaUploads(state: NewsMediaUploadState) {
  return state.zh || state.en;
}

export type Language = "zh" | "en";

export function pickLocalized(
  zhValue: string | null,
  enValue: string | null,
  language: Language,
) {
  if (language === "zh") {
    return zhValue ?? enValue ?? "";
  }
  return enValue ?? zhValue ?? "";
}

export function buildUnsplashUrl(keyword: string, size: "thumb" | "hero" = "thumb") {
  const dimension = size === "hero" ? "1200x675" : "800x600";
  const encoded = encodeURIComponent(keyword || "community");
  return `https://source.unsplash.com/${dimension}/?${encoded}`;
}

export function resolveNewsCover(coverSource: string | null, size: "thumb" | "hero" = "thumb") {
  if (!coverSource) {
    return buildUnsplashUrl("community,news", size);
  }
  if (coverSource.startsWith("http") || coverSource.startsWith("/")) {
    return coverSource;
  }
  return buildUnsplashUrl(coverSource, size);
}

export function resolveEventImage(
  imageType: "unsplash" | "upload" | null,
  imageKeyword: string | null,
  imageUrl: string | null,
  size: "thumb" | "hero" = "thumb",
) {
  if (imageType === "upload" && imageUrl) {
    return imageUrl;
  }
  if (imageKeyword) {
    return buildUnsplashUrl(imageKeyword, size);
  }
  return buildUnsplashUrl("community event", size);
}

export function formatEventDateTime(
  eventDate: string,
  startTime: string | null,
  endTime: string | null,
  language: Language,
) {
  const locale = language === "zh" ? "zh-CN" : "en-US";
  const date = new Date(`${eventDate}T00:00:00Z`);
  const datePart = date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const formatTime = (time: string) => {
    const [hour = "00", minute = "00"] = time.split(":");
    return `${hour}:${minute}`;
  };

  if (!startTime && !endTime) return datePart;
  if (startTime && endTime) {
    return `${datePart} ${formatTime(startTime)} - ${formatTime(endTime)}`;
  }
  return `${datePart} ${formatTime(startTime || endTime!)}`;
}

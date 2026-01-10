export const SPLASH_READY_CLASS = "vmca-preload-ready";
export const SPLASH_PRELOAD_STORAGE_KEY = "vmca_preload_assets_v1";
export const SPLASH_PRELOAD_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Home: hero + carousel images (critical for first load experience)
export const HOME_PRELOAD_IMAGES = [
  "/assets/hero.jpg",
  "/assets/4e1018159bf5b416cdd05a50c6634f65d81400fe.png",
  "/assets/02ce48a06b4eb30c56fbf30084752dbc46f6e5e8.png",
  "/assets/e64db2d9d10306a4e7b8be715dce92e0c0c49c49.png",
  "/assets/8ba07f20524fc73fdf6468451fb157940959f60e.png",
  "/assets/c47e6fc792d8b9f97dd68ae29a97bfa32594f251.png",
  "/assets/928ec88ac46c7ad8c5c157f2f73842edb6fb5c04.png",
] as const;

// About: images only (video is intentionally excluded)
export const ABOUT_PRELOAD_IMAGES = [
  "/assets/2aee091727a5d832328a3b5cf9e2dcdf4f43542d.png",
  "/assets/9c9d7d0442d12b5d716010d1dbb6304d01dcc148.png",
] as const;

export const SPLASH_PRELOAD_IMAGES = [
  ...HOME_PRELOAD_IMAGES,
  ...ABOUT_PRELOAD_IMAGES,
] as const;

export const SPLASH_PRELOAD_MANIFEST = JSON.stringify({
  home: HOME_PRELOAD_IMAGES,
  about: ABOUT_PRELOAD_IMAGES,
});

export type SplashPreloadCacheRecord = {
  manifest: string;
  ts: number;
};

export function parseSplashPreloadCacheRecord(
  raw: string | null
): SplashPreloadCacheRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SplashPreloadCacheRecord>;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof parsed.manifest !== "string" ||
      typeof parsed.ts !== "number"
    ) {
      return null;
    }
    return { manifest: parsed.manifest, ts: parsed.ts };
  } catch {
    return null;
  }
}

export function isSplashPreloadCacheValid(
  record: SplashPreloadCacheRecord | null,
  now = Date.now()
): boolean {
  if (!record) return false;
  if (record.manifest !== SPLASH_PRELOAD_MANIFEST) return false;
  if (!Number.isFinite(record.ts)) return false;
  return now - record.ts <= SPLASH_PRELOAD_TTL_MS;
}


export type SeoPageType = "website" | "article" | "event";

export type HreflangLink = {
  hrefLang: string;
  href: string;
};

export type JsonLdObject = Record<string, unknown>;
export type JsonLd = JsonLdObject | JsonLdObject[];

export type LocalizedText = {
  zh?: string | null;
  en?: string | null;
};

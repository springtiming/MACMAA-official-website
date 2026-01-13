import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { absoluteUrl, site } from "@/lib/seo/config";
import {
  createArticleJsonLd,
  createEventJsonLd,
  createOrganizationJsonLd,
  truncateDescription,
} from "@/lib/seo/utils";
import type {
  HreflangLink,
  JsonLd,
  JsonLdObject,
  SeoPageType,
} from "@/lib/seo/types";
import { SeoHead } from "./SeoHead";
import { JsonLd as JsonLdComponent } from "./JsonLd";

type PageSeoProps = {
  type?: SeoPageType;
  title?: string;
  titleZh?: string | null;
  titleEn?: string | null;
  description?: string;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  canonicalPath?: string;
  image?: string;
  noindex?: boolean;
  nofollow?: boolean;
  hreflangs?: HreflangLink[];

  publishedAt?: string | null;
  updatedAt?: string | null;
  author?: string;

  eventDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  price?: number | null;
  priceCurrency?: string;

  includeOrganizationJsonLd?: boolean;
  jsonLd?: JsonLd | null;
};

function pickLocalized(
  language: "zh" | "en",
  zhValue: string | null | undefined,
  enValue: string | null | undefined
) {
  if (language === "zh") return (zhValue ?? enValue ?? "").trim();
  return (enValue ?? zhValue ?? "").trim();
}

function normalizeJsonLd(data: JsonLd | null | undefined) {
  if (!data) return [];
  return (Array.isArray(data) ? data : [data]).filter(
    Boolean
  ) as JsonLdObject[];
}

export function PageSeo(props: PageSeoProps) {
  const { language } = useLanguage();

  const {
    type: rawType,
    title,
    titleZh,
    titleEn,
    description,
    descriptionZh,
    descriptionEn,
    canonicalPath: rawCanonicalPath,
    image,
    noindex,
    nofollow,
    hreflangs,
    publishedAt,
    updatedAt,
    author,
    eventDate,
    startTime,
    endTime,
    location,
    price,
    priceCurrency,
    includeOrganizationJsonLd,
    jsonLd,
  } = props;

  const type = rawType ?? "website";

  const resolvedTitle =
    title?.trim() ||
    pickLocalized(language, titleZh, titleEn) ||
    site.defaultTitle;

  const resolvedDescription = truncateDescription(
    (
      description?.trim() ||
      pickLocalized(language, descriptionZh, descriptionEn) ||
      site.defaultDescription
    ).trim()
  );

  const canonicalPath = rawCanonicalPath?.trim();
  const canonicalUrl = canonicalPath ? absoluteUrl(canonicalPath) : site.url;

  const jsonLdEntries = useMemo(() => {
    const entries: JsonLdObject[] = [];

    if (includeOrganizationJsonLd) {
      entries.push(createOrganizationJsonLd());
    }

    if (type === "article") {
      entries.push(
        createArticleJsonLd({
          url: canonicalUrl,
          headline: resolvedTitle,
          description: resolvedDescription,
          image: image ?? undefined,
          datePublished: publishedAt ?? undefined,
          dateModified: updatedAt ?? undefined,
          authorName: author ?? undefined,
        })
      );
    }

    if (type === "event" && eventDate) {
      const offers =
        typeof price === "number" ? { price, priceCurrency } : null;

      entries.push(
        createEventJsonLd({
          url: canonicalUrl,
          name: resolvedTitle,
          description: resolvedDescription,
          image: image ?? undefined,
          startDate: { date: eventDate, time: startTime },
          endDate: endTime ? { date: eventDate, time: endTime } : null,
          locationName: location ?? undefined,
          offers,
        })
      );
    }

    entries.push(...normalizeJsonLd(jsonLd));

    return entries.length ? entries : null;
  }, [
    canonicalUrl,
    author,
    endTime,
    eventDate,
    image,
    includeOrganizationJsonLd,
    jsonLd,
    location,
    price,
    priceCurrency,
    publishedAt,
    resolvedDescription,
    resolvedTitle,
    startTime,
    type,
    updatedAt,
  ]);

  return (
    <>
      <SeoHead
        type={type}
        title={resolvedTitle}
        description={resolvedDescription}
        canonicalPath={canonicalPath}
        ogImage={image}
        noindex={noindex}
        nofollow={nofollow}
        hreflangs={hreflangs}
      />
      <JsonLdComponent data={jsonLdEntries} />
    </>
  );
}

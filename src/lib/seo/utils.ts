import { absoluteUrl, organization, site } from "./config";
import type { JsonLdObject } from "./types";

export function buildTitle(title?: string) {
  const base = (title ?? "").trim();
  if (!base) return `${site.defaultTitle} | ${site.name}`;
  if (base.includes(site.name)) return base;
  return `${base} | ${site.name}`;
}

export function normalizePathname(path: string) {
  const withoutHash = path.split("#")[0] ?? path;
  return (withoutHash.split("?")[0] ?? withoutHash).trim();
}

export function truncateDescription(input: string, maxLength = 160) {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function safeJsonStringify(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function createOrganizationJsonLd(): JsonLdObject {
  const address = organization.address
    ? {
        "@type": "PostalAddress",
        ...organization.address,
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organization.legalName ?? organization.name,
    alternateName: organization.alternateName,
    url: site.url,
    email: organization.email,
    telephone: organization.telephone,
    logo: absoluteUrl(site.defaultOgImage),
    image: absoluteUrl(site.defaultOgImage),
    ...(address ? { address } : {}),
  };
}

export function createArticleJsonLd(input: {
  url: string;
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}): JsonLdObject {
  const publisherName = organization.legalName ?? organization.name;
  const publisherLogoUrl = absoluteUrl(site.defaultOgImage);
  const publisher = {
    "@type": "Organization",
    name: publisherName,
    logo: {
      "@type": "ImageObject",
      url: publisherLogoUrl,
    },
  };

  const imageUrl = input.image ? absoluteUrl(input.image) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.authorName
      ? {
          author: {
            "@type": "Organization",
            name: input.authorName,
          },
        }
      : {}),
    publisher,
  };
}

function toIsoDateTime(date: string, time?: string | null) {
  const normalizedDate = date.trim();
  if (!normalizedDate) return null;
  const trimmedTime = (time ?? "").trim();
  if (!trimmedTime) return normalizedDate;
  const normalizedTime =
    trimmedTime.length === 5 ? `${trimmedTime}:00` : trimmedTime;
  return `${normalizedDate}T${normalizedTime}`;
}

export function createEventJsonLd(input: {
  url: string;
  name: string;
  description?: string;
  image?: string;
  startDate: { date: string; time?: string | null };
  endDate?: { date: string; time?: string | null } | null;
  locationName?: string;
  offers?: { price: number; priceCurrency?: string } | null;
}): JsonLdObject {
  const imageUrl = input.image ? absoluteUrl(input.image) : undefined;
  const startDate = toIsoDateTime(input.startDate.date, input.startDate.time);
  const endDate = input.endDate
    ? toIsoDateTime(input.endDate.date, input.endDate.time)
    : null;

  const location = input.locationName
    ? {
        "@type": "Place",
        name: input.locationName,
        address: input.locationName,
      }
    : undefined;

  const offers = input.offers
    ? {
        "@type": "Offer",
        url: input.url,
        price: input.offers.price,
        priceCurrency: input.offers.priceCurrency ?? "AUD",
        availability: "https://schema.org/InStock",
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(location ? { location } : {}),
    ...(offers ? { offers } : {}),
  };
}

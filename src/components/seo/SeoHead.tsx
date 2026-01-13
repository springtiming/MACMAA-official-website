import Head from "next/head";
import { useRouter } from "next/router";
import { absoluteUrl, site } from "@/lib/seo/config";
import {
  buildTitle,
  normalizePathname,
  truncateDescription,
} from "@/lib/seo/utils";
import type { HreflangLink, SeoPageType } from "@/lib/seo/types";

type SeoHeadProps = {
  type?: SeoPageType;
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
  hreflangs?: HreflangLink[];
};

export function SeoHead({
  type = "website",
  title,
  description,
  canonicalPath,
  ogImage,
  noindex,
  nofollow,
  hreflangs,
}: SeoHeadProps) {
  const router = useRouter();

  const resolvedTitle = buildTitle(title);
  const resolvedDescription = truncateDescription(
    (description ?? site.defaultDescription).trim()
  );

  const resolvedCanonicalPath =
    canonicalPath?.trim() ||
    (router.isReady ? normalizePathname(router.asPath) : "");
  const canonicalUrl = resolvedCanonicalPath
    ? absoluteUrl(resolvedCanonicalPath)
    : "";

  const resolvedOgImage = absoluteUrl(
    (ogImage ?? site.defaultOgImage).trim() || site.defaultOgImage
  );

  const ogType = type === "article" ? "article" : type;

  const robots = [
    noindex ? "noindex" : "index",
    nofollow ? "nofollow" : "follow",
  ]
    .filter(Boolean)
    .join(",");

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="robots" content={robots} />

      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      {hreflangs?.length
        ? hreflangs.map((link) => (
            <link
              key={`${link.hrefLang}:${link.href}`}
              rel="alternate"
              hrefLang={link.hrefLang}
              href={absoluteUrl(link.href)}
            />
          ))
        : null}

      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={resolvedOgImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
    </Head>
  );
}

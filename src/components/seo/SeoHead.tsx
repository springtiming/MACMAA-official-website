import Head from "next/head";
import { useRouter } from "next/router";
import { absoluteUrl, site } from "@/config/site";

type SeoHeadProps = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
};

function buildTitle(title?: string) {
  const base = (title ?? "").trim();
  if (!base) return `${site.defaultTitle} | ${site.name}`;
  if (base.includes(site.name)) return base;
  return `${base} | ${site.name}`;
}

function normalizePathname(path: string) {
  const withoutHash = path.split("#")[0] ?? path;
  return (withoutHash.split("?")[0] ?? withoutHash).trim();
}

export function SeoHead({
  title,
  description,
  canonicalPath,
  ogImage,
  noindex,
  nofollow,
}: SeoHeadProps) {
  const router = useRouter();

  const resolvedTitle = buildTitle(title);
  const resolvedDescription = (description ?? site.defaultDescription).trim();

  const resolvedCanonicalPath =
    canonicalPath?.trim() ||
    (router.isReady ? normalizePathname(router.asPath) : "");
  const canonicalUrl = resolvedCanonicalPath
    ? absoluteUrl(resolvedCanonicalPath)
    : "";

  const resolvedOgImage = absoluteUrl(
    (ogImage ?? site.defaultOgImage).trim() || site.defaultOgImage
  );

  const robots = [noindex ? "noindex" : "index", nofollow ? "nofollow" : "follow"]
    .filter(Boolean)
    .join(",");

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="robots" content={robots} />

      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      <meta property="og:site_name" content={site.name} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      <meta property="og:type" content="website" />
      <meta property="og:image" content={resolvedOgImage} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
    </Head>
  );
}


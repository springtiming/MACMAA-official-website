export type SiteConfig = {
  name: string;
  url: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
};

export type OrganizationConfig = {
  name: string;
  legalName?: string;
  alternateName?: string;
  email?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
};

function normalizeSiteUrl(input: string) {
  const trimmed = input.trim().replace(/\/+$/, "");
  if (!trimmed) return "https://macmaa.org.au";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export const site: SiteConfig = {
  name: "MACMAA",
  url: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://macmaa.org.au"
  ),
  defaultTitle: "澳洲万年市华人互助会官网",
  defaultDescription:
    "澳洲万年市华人互助会（MACMAA）官方网站。服务年长者，推动邻里互助、社区融合与文化传承。提供社区活动、新闻动态与会员申请等服务。",
  defaultOgImage: "/assets/486cb6c21a188aae71ad06b3d541eb54ff86e307.png",
};

export const organization: OrganizationConfig = {
  name: "MACMAA",
  legalName: "Manningham Australian Chinese Mutual Aid Association",
  alternateName: "澳洲万年市华人互助会",
  email: "macmaa112025@gmail.com",
  telephone: "0451 727 631",
  address: {
    streetAddress: "293-297 Manningham Rd",
    addressLocality: "Templestowe Lower",
    addressRegion: "VIC",
    postalCode: "3107",
    addressCountry: "AU",
  },
};

export function absoluteUrl(pathOrUrl: string) {
  const value = pathOrUrl.trim();
  if (!value) return site.url;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${site.url}${normalizedPath}`;
}

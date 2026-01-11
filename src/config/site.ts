type SiteConfig = {
  name: string;
  url: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
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

export function absoluteUrl(pathOrUrl: string) {
  const value = pathOrUrl.trim();
  if (!value) return site.url;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${site.url}${normalizedPath}`;
}

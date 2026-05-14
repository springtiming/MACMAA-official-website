export function getPageTransitionKey(
  asPath: string,
  splashComplete: boolean
): string {
  const pathname = asPath.split("#")[0]?.split("?")[0] ?? asPath;

  if (pathname !== "/") {
    return asPath;
  }

  return `${asPath}::${splashComplete ? "ready" : "loading"}`;
}

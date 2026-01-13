import { Home } from "@/features/site/Home";
import { PageSeo } from "@/components/seo/PageSeo";

export default function HomePage() {
  return (
    <>
      <PageSeo
        type="website"
        canonicalPath="/"
        title="澳洲万年市华人互助会官网"
        includeOrganizationJsonLd
      />
      <Home />
    </>
  );
}

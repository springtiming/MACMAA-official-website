import { Home } from "@/features/site/Home";
import { PageSeo } from "@/components/seo/PageSeo";

type HomePageProps = {
  splashComplete?: boolean;
};

export default function HomePage({
  splashComplete = false,
}: HomePageProps) {
  return (
    <>
      <PageSeo
        type="website"
        canonicalPath="/"
        title="澳洲万年市华人互助会官网"
        includeOrganizationJsonLd
      />
      <Home splashComplete={splashComplete} />
    </>
  );
}

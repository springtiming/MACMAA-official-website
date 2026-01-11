import { Home } from "@/features/site/Home";
import { SeoHead } from "@/components/seo/SeoHead";

export default function HomePage() {
  return (
    <>
      <SeoHead canonicalPath="/" title="澳洲万年市华人互助会官网" />
      <Home />
    </>
  );
}

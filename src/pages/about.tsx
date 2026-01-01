import { About } from "@/features/site/About";
import { SeoHead } from "@/components/seo/SeoHead";

export default function AboutPage() {
  return (
    <>
      <SeoHead
        canonicalPath="/about"
        title="协会简介"
        description="了解澳洲万年市华人互助会（MACMAA）的使命、愿景与服务内容。"
      />
      <About />
    </>
  );
}

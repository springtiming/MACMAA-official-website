import { NewsDetail } from "@/features/news/NewsDetail";
import { SeoHead } from "@/components/seo/SeoHead";

export default function NewsDetailPage() {
  return (
    <>
      <SeoHead title="新闻详情" description="阅读澳洲万年市华人互助会（MACMAA）新闻动态。" />
      <NewsDetail />
    </>
  );
}

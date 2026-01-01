import { NewsList } from "@/features/news/NewsList";
import { SeoHead } from "@/components/seo/SeoHead";

export default function NewsListPage() {
  return (
    <>
      <SeoHead
        canonicalPath="/news"
        title="新闻动态"
        description="查看澳洲万年市华人互助会（MACMAA）最新新闻、公告与社区动态。"
      />
      <NewsList />
    </>
  );
}

import { NewsDetail } from "@/features/news/NewsDetail";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { PageSeo } from "@/components/seo/PageSeo";
import { fetchNewsPostById, type NewsPostRecord } from "@/lib/supabaseApi";
import { resolveNewsCover } from "@/lib/supabaseHelpers";

type NewsDetailPageProps = {
  news: NewsPostRecord;
};

export const getServerSideProps: GetServerSideProps<
  NewsDetailPageProps
> = async (context) => {
  const idParam = context.params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) return { notFound: true };

  try {
    const news = await fetchNewsPostById(id);
    if (!news) return { notFound: true };
    return { props: { news } };
  } catch {
    return { notFound: true };
  }
};

export default function NewsDetailPage({
  news,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <PageSeo
        type="article"
        canonicalPath={`/news/${news.id}`}
        titleZh={news.title_zh}
        titleEn={news.title_en}
        descriptionZh={news.summary_zh}
        descriptionEn={news.summary_en}
        image={resolveNewsCover(
          news.cover_source,
          "hero",
          news.cover_keyword,
          news.cover_url
        )}
        publishedAt={news.published_at}
        author="MACMAA"
      />
      <NewsDetail initialNews={news} />
    </>
  );
}

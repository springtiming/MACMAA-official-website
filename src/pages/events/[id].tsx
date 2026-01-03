import { EventDetail } from "@/features/events/EventDetail";
import { SeoHead } from "@/components/seo/SeoHead";

export default function EventDetailPage() {
  return (
    <>
      <SeoHead
        title="活动详情"
        description="查看 MACMAA 活动详情与相关信息。"
      />
      <EventDetail />
    </>
  );
}

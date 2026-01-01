import { EventList } from "@/features/events/EventList";
import { SeoHead } from "@/components/seo/SeoHead";

export default function EventListPage() {
  return (
    <>
      <SeoHead
        canonicalPath="/events"
        title="活动中心"
        description="查看 MACMAA 最新活动信息与报名方式。"
      />
      <EventList />
    </>
  );
}

import { EventDetail } from "@/features/events/EventDetail";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { PageSeo } from "@/components/seo/PageSeo";
import { fetchEventById, type EventRecord } from "@/lib/supabaseApi";
import { resolveEventImage } from "@/lib/supabaseHelpers";

type EventDetailPageProps = {
  event: EventRecord;
};

export const getServerSideProps: GetServerSideProps<
  EventDetailPageProps
> = async (context) => {
  const idParam = context.params?.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) return { notFound: true };

  try {
    const event = await fetchEventById(id);
    if (!event) return { notFound: true };
    return { props: { event } };
  } catch {
    return { notFound: true };
  }
};

export default function EventDetailPage({
  event,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <PageSeo
        type="event"
        canonicalPath={`/events/${event.id}`}
        titleZh={event.title_zh}
        titleEn={event.title_en}
        descriptionZh={event.description_zh}
        descriptionEn={event.description_en}
        image={resolveEventImage(
          event.image_type,
          event.image_keyword,
          event.image_url,
          "hero"
        )}
        eventDate={event.event_date}
        startTime={event.start_time}
        endTime={event.end_time}
        location={event.location}
        price={event.fee}
        priceCurrency="AUD"
      />
      <EventDetail initialEvent={event} />
    </>
  );
}

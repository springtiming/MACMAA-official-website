import { EventRegistration } from "@/features/events/EventRegistration";
import { SeoHead } from "@/components/seo/SeoHead";

export default function EventRegistrationPage() {
  return (
    <>
      <SeoHead title="活动报名" noindex nofollow />
      <EventRegistration />
    </>
  );
}

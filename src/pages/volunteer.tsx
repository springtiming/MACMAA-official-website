import { Volunteer } from "@/features/volunteer/Volunteer";
import { SeoHead } from "@/components/seo/SeoHead";

export default function VolunteerPage() {
  return (
    <>
      <SeoHead
        canonicalPath="/volunteer"
        title="志愿者招募"
        description="加入 MACMAA 志愿者团队，一起组织社区活动，服务华人长者。"
      />
      <Volunteer />
    </>
  );
}

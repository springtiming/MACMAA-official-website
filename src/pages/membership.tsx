import { Membership } from "@/features/membership/Membership";
import { SeoHead } from "@/components/seo/SeoHead";

export default function MembershipPage() {
  return (
    <>
      <SeoHead
        canonicalPath="/membership"
        title="会员申请"
        description="申请成为 MACMAA 会员，获取社区服务与活动优惠。"
      />
      <Membership />
    </>
  );
}

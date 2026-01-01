import { AdminLogin } from "@/features/admin/AdminLogin";
import { SeoHead } from "@/components/seo/SeoHead";

export default function AdminLoginPage() {
  return (
    <>
      <SeoHead title="后台登录" noindex nofollow />
      <AdminLogin />
    </>
  );
}

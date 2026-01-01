import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SeoHead } from "@/components/seo/SeoHead";

const AdminSettings = dynamic(
  () =>
    import("@/features/admin/AdminSettings").then((mod) => mod.AdminSettings),
  { ssr: false }
);

export default function AdminSettingsPage() {
  return (
    <>
      <SeoHead title="账号设置" noindex nofollow />
      <ProtectedRoute>
        <AdminSettings />
      </ProtectedRoute>
    </>
  );
}

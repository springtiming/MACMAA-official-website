import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SeoHead } from "@/components/seo/SeoHead";

const AdminDashboard = dynamic(
  () =>
    import("@/features/admin/AdminDashboard").then((mod) => mod.AdminDashboard),
  { ssr: false }
);

export default function AdminDashboardPage() {
  return (
    <>
      <SeoHead title="管理后台" noindex nofollow />
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    </>
  );
}

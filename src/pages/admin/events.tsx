import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SeoHead } from "@/components/seo/SeoHead";

const AdminEvents = dynamic(
  () => import("@/features/admin/AdminEvents").then((mod) => mod.AdminEvents),
  { ssr: false }
);

export default function AdminEventsPage() {
  return (
    <>
      <SeoHead title="活动管理" noindex nofollow />
      <ProtectedRoute>
        <AdminEvents />
      </ProtectedRoute>
    </>
  );
}

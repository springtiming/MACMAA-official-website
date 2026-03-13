import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SeoHead } from "@/components/seo/SeoHead";

const AdminVolunteers = dynamic(
  () =>
    import("@/features/admin/AdminVolunteers").then(
      (mod) => mod.AdminVolunteers
    ),
  { ssr: false }
);

export default function AdminVolunteersPage() {
  return (
    <>
      <SeoHead title="志愿者申请审核" noindex nofollow />
      <ProtectedRoute>
        <AdminVolunteers />
      </ProtectedRoute>
    </>
  );
}

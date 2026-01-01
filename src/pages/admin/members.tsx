import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SeoHead } from "@/components/seo/SeoHead";

const AdminMembers = dynamic(
  () => import("@/features/admin/AdminMembers").then((mod) => mod.AdminMembers),
  { ssr: false }
);

export default function AdminMembersPage() {
  return (
    <>
      <SeoHead title="会员管理" noindex nofollow />
      <ProtectedRoute>
        <AdminMembers />
      </ProtectedRoute>
    </>
  );
}

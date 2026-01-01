import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminMembers = dynamic(
  () => import("@/features/admin/AdminMembers").then((mod) => mod.AdminMembers),
  { ssr: false }
);

export default function AdminMembersPage() {
  return (
    <ProtectedRoute>
      <AdminMembers />
    </ProtectedRoute>
  );
}

import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminNews = dynamic(
  () => import("@/features/admin/AdminNews").then((mod) => mod.AdminNews),
  { ssr: false }
);

export default function AdminNewsPage() {
  return (
    <ProtectedRoute>
      <AdminNews />
    </ProtectedRoute>
  );
}

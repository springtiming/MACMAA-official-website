import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminEvents = dynamic(
  () => import("@/features/admin/AdminEvents").then((mod) => mod.AdminEvents),
  { ssr: false }
);

export default function AdminEventsPage() {
  return (
    <ProtectedRoute>
      <AdminEvents />
    </ProtectedRoute>
  );
}

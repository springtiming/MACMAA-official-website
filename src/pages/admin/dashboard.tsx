import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminDashboard = dynamic(
  () =>
    import("@/features/admin/AdminDashboard").then((mod) => mod.AdminDashboard),
  { ssr: false }
);

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

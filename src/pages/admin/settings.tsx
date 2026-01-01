import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminSettings = dynamic(
  () =>
    import("@/features/admin/AdminSettings").then((mod) => mod.AdminSettings),
  { ssr: false }
);

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute>
      <AdminSettings />
    </ProtectedRoute>
  );
}

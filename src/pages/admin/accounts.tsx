import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const AdminAccounts = dynamic(
  () =>
    import("@/features/admin/AdminAccounts").then((mod) => mod.AdminAccounts),
  { ssr: false }
);

export default function AdminAccountsPage() {
  return (
    <ProtectedRoute ownerOnly>
      <AdminAccounts />
    </ProtectedRoute>
  );
}

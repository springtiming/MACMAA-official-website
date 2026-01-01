import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SeoHead } from "@/components/seo/SeoHead";

const AdminAccounts = dynamic(
  () =>
    import("@/features/admin/AdminAccounts").then((mod) => mod.AdminAccounts),
  { ssr: false }
);

export default function AdminAccountsPage() {
  return (
    <>
      <SeoHead title="账户管理" noindex nofollow />
      <ProtectedRoute ownerOnly>
        <AdminAccounts />
      </ProtectedRoute>
    </>
  );
}

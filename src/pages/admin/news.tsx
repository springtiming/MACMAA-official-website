import dynamic from "next/dynamic";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SeoHead } from "@/components/seo/SeoHead";

const AdminNews = dynamic(
  () => import("@/features/admin/AdminNews").then((mod) => mod.AdminNews),
  { ssr: false }
);

export default function AdminNewsPage() {
  return (
    <>
      <SeoHead title="新闻管理" noindex nofollow />
      <ProtectedRoute>
        <AdminNews />
      </ProtectedRoute>
    </>
  );
}

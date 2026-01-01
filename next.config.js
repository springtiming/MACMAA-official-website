/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.VITE_SUPABASE_ANON_KEY ??
      "",
    NEXT_PUBLIC_ADMIN_API_BASE:
      process.env.NEXT_PUBLIC_ADMIN_API_BASE ??
      process.env.VITE_ADMIN_API_BASE ??
      "/api",
    NEXT_PUBLIC_ENABLE_MOCK_ADMIN_ACCOUNTS:
      process.env.NEXT_PUBLIC_ENABLE_MOCK_ADMIN_ACCOUNTS ??
      process.env.VITE_ENABLE_MOCK_ADMIN_ACCOUNTS ??
      "",
  },
};

module.exports = nextConfig;


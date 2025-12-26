-- 修复权限检查函数的 RLS 递归问题
-- 使用 SECURITY DEFINER 让权限检查函数绕过 RLS

-- 修复 is_service_role 函数
CREATE OR REPLACE FUNCTION public.is_service_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role';
$$;

-- 修复 is_admin 函数
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_service_role()
    OR EXISTS (
      SELECT 1
      FROM public.admin_accounts a
      WHERE a.id = auth.uid()
        AND a.status = 'active'
        AND a.role IN ('admin', 'owner')
    );
$$;

-- 修复 is_owner 函数
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_service_role()
    OR EXISTS (
      SELECT 1
      FROM public.admin_accounts a
      WHERE a.id = auth.uid()
        AND a.status = 'active'
        AND a.role = 'owner'
    );
$$;

-- 修复 is_approved_member 函数
CREATE OR REPLACE FUNCTION public.is_approved_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_service_role()
    OR EXISTS (
      SELECT 1
      FROM public.members m
      WHERE m.auth_user_id = auth.uid()
        AND m.status = 'approved'
    );
$$;

-- 支付凭证字段
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof TEXT;


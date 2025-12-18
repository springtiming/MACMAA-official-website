-- 支持银行转账/PayID 支付
-- 添加支付状态跟踪和管理员确认功能

-- 1. 添加新列
ALTER TABLE public.event_registrations 
  ADD COLUMN IF NOT EXISTS reference_code TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'confirmed',
  ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.admin_accounts(id),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. 添加唯一约束（reference_code 需要唯一）
ALTER TABLE public.event_registrations 
  DROP CONSTRAINT IF EXISTS event_registrations_reference_code_key;
ALTER TABLE public.event_registrations 
  ADD CONSTRAINT event_registrations_reference_code_key UNIQUE (reference_code);

-- 3. 添加 payment_status 检查约束
ALTER TABLE public.event_registrations 
  DROP CONSTRAINT IF EXISTS event_registrations_payment_status_check;
ALTER TABLE public.event_registrations 
  ADD CONSTRAINT event_registrations_payment_status_check 
    CHECK (payment_status IN ('pending', 'confirmed', 'expired', 'cancelled'));

-- 4. 更新 payment_method 约束，增加 payid 选项
ALTER TABLE public.event_registrations 
  DROP CONSTRAINT IF EXISTS event_registrations_payment_method_check;
ALTER TABLE public.event_registrations 
  ADD CONSTRAINT event_registrations_payment_method_check 
    CHECK (payment_method IN ('card', 'cash', 'transfer', 'payid'));

-- 5. 索引：加速查询待确认订单
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_status 
  ON public.event_registrations (payment_status);

CREATE INDEX IF NOT EXISTS idx_event_registrations_reference_code 
  ON public.event_registrations (reference_code) 
  WHERE reference_code IS NOT NULL;

-- 6. 生成唯一 reference_code 的函数
CREATE OR REPLACE FUNCTION public.generate_reference_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 去掉容易混淆的 I/1/O/0
  result TEXT := 'VMCA-';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Seed initial owner admin account
INSERT INTO admin_accounts (id, username, email, password_hash, role, status, created_at)
VALUES (
  gen_random_uuid(),
  'owner_admin',
  'owner@macmaa.org',
  '$2b$12$LSBP5eri3XZEsWyAlYRPPOZNO.QWhe1GYwr1hHcKl36q.a4HyiDTG',
  'owner',
  'active',
  NOW()
)
ON CONFLICT (username) DO NOTHING;


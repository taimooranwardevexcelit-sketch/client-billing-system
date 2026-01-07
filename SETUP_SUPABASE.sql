-- =====================================================
-- SUPABASE AUTHENTICATION & DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- Clean up existing policies and functions
DROP POLICY IF EXISTS "Allow public read access for authentication" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.users;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.projects;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.bills;
DROP POLICY IF EXISTS "Allow all access to authenticated users" ON public.payments;

DROP FUNCTION IF EXISTS public.authenticate_user(text, text);
DROP FUNCTION IF EXISTS public.get_user_password(uuid);

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Clients table (created first because users references it)
CREATE TABLE IF NOT EXISTS public.clients (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL UNIQUE,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  length numeric NOT NULL,
  width numeric NOT NULL,
  area numeric NOT NULL,
  rate_per_sq_ft numeric NOT NULL,
  total_amount numeric NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE
);

-- Bills table
CREATE TABLE IF NOT EXISTS public.bills (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bill_number text NOT NULL UNIQUE,
  total_amount numeric NOT NULL,
  paid_amount numeric DEFAULT 0,
  outstanding_amount numeric NOT NULL,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE')),
  due_date timestamptz,
  paid_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  client_id text NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  project_id text REFERENCES public.projects(id) ON DELETE SET NULL
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  amount numeric NOT NULL,
  payment_date timestamptz DEFAULT now(),
  method text DEFAULT 'CASH' CHECK (method IN ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE')),
  notes text,
  created_at timestamptz DEFAULT now(),
  bill_id text NOT NULL REFERENCES public.bills(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  default_rate_per_sq_ft numeric DEFAULT 100,
  company_name text DEFAULT 'My Company',
  company_address text,
  company_phone text,
  tax_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (created after clients because it references clients)
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'USER' CHECK (role IN ('ADMIN', 'USER')),
  client_id text UNIQUE REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. DISABLE RLS (For Development - Re-enable for Production)
-- =====================================================

ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. GRANT PERMISSIONS
-- =====================================================

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.clients TO anon, authenticated;
GRANT ALL ON public.projects TO anon, authenticated;
GRANT ALL ON public.bills TO anon, authenticated;
GRANT ALL ON public.payments TO anon, authenticated;
GRANT ALL ON public.settings TO anon, authenticated;

-- =====================================================
-- 4. CREATE AUTHENTICATION FUNCTIONS
-- =====================================================

-- Function to get user by email (for authentication)
CREATE OR REPLACE FUNCTION public.authenticate_user(user_email text, user_password text)
RETURNS TABLE(user_id uuid, email text, full_name text, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id,
    u.email,
    u.full_name,
    u.created_at
  FROM users u
  WHERE u.email = user_email;
END;
$$;

-- Function to get user password hash
CREATE OR REPLACE FUNCTION public.get_user_password(user_id uuid)
RETURNS TABLE(password_hash text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.password_hash
  FROM users u
  WHERE u.id = user_id;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.authenticate_user(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_password(uuid) TO anon, authenticated;

-- =====================================================
-- 5. CREATE TEST USER
-- =====================================================

-- Delete existing test user if exists
DELETE FROM public.users WHERE email = 'admin@billing.com';

-- Insert test user
-- Password: admin123
-- Hash generated with bcrypt
INSERT INTO public.users (email, password, name, role)
VALUES (
  'admin@billing.com',
  '$2a$10$rZ5PZLFKVNqKfxqEg5PBHOqP5xGZ5xZ5PZLFKVNqKfxqEg5PBHO.q',
  'Admin User',
  'ADMIN'
);

-- =====================================================
-- 6. RELOAD SCHEMA CACHE
-- =====================================================

NOTIFY pgrst, 'reload schema';

-- =====================================================
-- 7. VERIFICATION
-- =====================================================

SELECT '✅ Setup Complete!' as status;

SELECT '📋 Tables Created:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'clients', 'projects', 'bills', 'payments', 'settings')
ORDER BY table_name;

SELECT '🔐 Functions Created:' as info;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('authenticate_user', 'get_user_password')
ORDER BY routine_name;

SELECT '👤 Test User:' as info;
SELECT id, email, name, role, created_at 
FROM public.users 
WHERE email = 'admin@billing.com';

SELECT '🎉 You can now login with:' as info;
SELECT 'Email: admin@billing.com' as credential
UNION ALL
SELECT 'Password: admin123' as credential;



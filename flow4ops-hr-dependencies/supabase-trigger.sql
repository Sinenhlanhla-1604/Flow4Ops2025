-- ============================================
-- SUPABASE TRIGGER: Auto-create user record
-- ============================================
-- 
-- This trigger automatically creates a user record in the 'users' table
-- when a new user signs up in Supabase Authentication
-- 
-- Run this in Supabase SQL Editor
--

-- First, ensure you have a default organization
INSERT INTO organizations (id, name, slug)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Default Organization',
  'default-org'
)
ON CONFLICT (id) DO NOTHING;

-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    org_id,
    email,
    name,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    '11111111-1111-1111-1111-111111111111',  -- Default org_id
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),  -- Use name from metadata or email
    'employee',  -- Default role
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VERIFY THE TRIGGER
-- ============================================
-- Test that the trigger exists:
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- ============================================
-- MANUAL FIX FOR EXISTING USERS
-- ============================================
-- Run this if you already have users without records in the users table

-- This will create user records for all auth.users that don't have matching records
INSERT INTO public.users (id, org_id, email, name, role, is_active)
SELECT 
  au.id,
  '11111111-1111-1111-1111-111111111111',
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  'employee',  -- Default role
  true
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
)
ON CONFLICT (id) DO NOTHING;




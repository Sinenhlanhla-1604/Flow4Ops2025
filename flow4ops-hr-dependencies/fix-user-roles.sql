-- ============================================
-- FIX USER ROLES IN DATABASE
-- ============================================
-- 
-- Run this in Supabase SQL Editor to fix user roles
--

-- First, check what users you have
SELECT id, email, name, role, department FROM users ORDER BY created_at DESC;

-- Update the current user's role
-- Run ONE of these based on what role you want to test:

-- Option 1: Set as HR user
UPDATE users 
SET role = 'hr', 
    name = COALESCE(name, email),
    department = COALESCE(department, 'Human Resources')
WHERE email = 'mlotshwasine1@gmail.com';

-- Option 2: Set as Employee user (regular)
UPDATE users 
SET role = 'employee',
    name = COALESCE(name, email),
    department = COALESCE(department, 'Operations')
WHERE email = 'insangelousapparel@gmail.com';

-- To create a second test user with different role:
-- 1. Sign up in your app with a different email (or go to Supabase Auth > Users > Add User)
-- 2. Then run this UPDATE for that user:
--
-- UPDATE users 
-- SET role = 'hr'  -- or 'employee' for the other role
-- WHERE email = 'your-other-email@example.com';

-- Verify the updates
SELECT id, email, name, role, department FROM users;

-- ============================================
-- CREATE TEST ORGANIZATION (if it doesn't exist)
-- ============================================
-- You may need to create a test organization first

INSERT INTO organizations (id, name, slug)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test Company',
  'test-company'
)
ON CONFLICT (id) DO NOTHING;

-- Update user's org_id if needed
UPDATE users 
SET org_id = '11111111-1111-1111-1111-111111111111'
WHERE email = 'mlotshwasine1@gmail.com';




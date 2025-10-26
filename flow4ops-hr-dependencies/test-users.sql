-- ============================================
-- TEST USERS FOR FLOW4OPS
-- ============================================
-- 
-- First, create these users in Supabase Authentication:
-- 1. Go to Authentication > Users > Add User (or use Sign Up)
-- 2. Create user with email/password or magic link
-- 3. Copy their UUID from the users list
-- 4. Replace the UUIDs below with actual user IDs
--
-- Or use this approach: Insert auth users first, then link to users table

-- ============================================
-- OPTION 1: Complete SQL (if you have the user IDs)
-- ============================================

-- Employee User (Regular)
INSERT INTO users (id, org_id, email, name, role, department, is_active)
VALUES (
  'USER_UUID_EMPLOYEE',  -- Replace with actual auth.users UUID
  '11111111-1111-1111-1111-111111111111',  -- Test Company org_id
  'employee@testcompany.com',
  'John Employee',
  'employee',
  'Operations',
  true
);

-- HR User
INSERT INTO users (id, org_id, email, name, role, department, is_active)
VALUES (
  'USER_UUID_HR',  -- Replace with actual auth.users UUID
  '11111111-1111-1111-1111-111111111111',  -- Test Company org_id
  'hr@testcompany.com',
  'Sarah HR Manager',
  'hr',
  'Human Resources',
  true
);

-- ============================================
-- OPTION 2: Quick Test (Manual Sign Up)
-- ============================================
-- 
-- 1. Sign up with these credentials in your app:
--
-- **Employee User:**
-- Email: employee@testcompany.com
-- Password: employee123
-- 
-- **HR User:**
-- Email: hr@testcompany.com
-- Password: hr12345
--
-- 2. Then run these UPDATE statements after sign up:
--
-- UPDATE users 
-- SET name = 'John Employee', department = 'Operations' 
-- WHERE email = 'employee@testcompany.com';
--
-- UPDATE users 
-- SET name = 'Sarah HR Manager', role = 'hr', department = 'Human Resources' 
-- WHERE email = 'hr@testcompany.com';

-- ============================================
-- OPTION 3: Create Test Users via Supabase API
-- ============================================
-- Use Supabase Admin API to create users programmatically
-- You'll need to use the Supabase admin client or API

-- Example Node.js script:
/*
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Create employee user
const { data: empUser, error: empError } = await supabase.auth.admin.createUser({
  email: 'employee@testcompany.com',
  password: 'employee123',
  email_confirm: true
});

if (empUser) {
  await supabase.from('users').insert({
    id: empUser.user.id,
    org_id: '11111111-1111-1111-1111-111111111111',
    email: 'employee@testcompany.com',
    name: 'John Employee',
    role: 'employee',
    department: 'Operations'
  });
}

// Create HR user
const { data: hrUser, error: hrError } = await supabase.auth.admin.createUser({
  email: 'hr@testcompany.com',
  password: 'hr12345',
  email_confirm: true
});

if (hrUser) {
  await supabase.from('users').insert({
    id: hrUser.user.id,
    org_id: '11111111-1111-1111-1111-111111111111',
    email: 'hr@testcompany.com',
    name: 'Sarah HR Manager',
    role: 'hr',
    department: 'Human Resources'
  });
}
*/

-- ============================================
-- VERIFY USERS
-- ============================================

-- Check created users
SELECT 
  u.id, 
  u.email, 
  u.name, 
  u.role, 
  u.department, 
  o.name as organization
FROM users u
LEFT JOIN organizations o ON u.org_id = o.id
ORDER BY u.created_at DESC;

-- ============================================
-- SAMPLE COMPLIANCE REQUESTS (Optional)
-- ============================================

-- Create sample compliance requests to test with
INSERT INTO compliance_requests (id, org_id, title, description, form_type, due_date, created_by)
VALUES 
  -- EEA1 Form Request
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Annual EEA1 Form Submission',
    'Please complete and submit your annual EEA1 Employment Equity Act declaration form.',
    'eea1',
    CURRENT_DATE + INTERVAL '30 days',
    NULL  -- Or insert HR user ID
  ),
  -- Disclosure of Interest
  (
    gen_random_uuid(),
    '11111111-1111-1111-1111-111111111111',
    'Disclosure of Interest Declaration',
    'Annual declaration of any conflicts of interest or financial interests.',
    'disclosure_of_interest',
    CURRENT_DATE + INTERVAL '45 days',
    NULL
  );

-- Check compliance requests
SELECT * FROM compliance_requests ORDER BY created_at DESC;


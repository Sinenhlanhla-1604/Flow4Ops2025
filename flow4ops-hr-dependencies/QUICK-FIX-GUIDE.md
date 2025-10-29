# Quick Fix: User Role Issue

## Problem
Your dashboard shows "ROLE: Not set" which means your user record in the database doesn't have a role assigned. This causes all users to land on the employee dashboard regardless of their intended role.

## Solution

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Update Your User's Role
Copy and run this SQL query (update the email to match your actual email):

```sql
-- Update your user to have the 'hr' role
UPDATE users 
SET 
  role = 'hr',
  name = COALESCE(name, email),
  department = COALESCE(department, 'Human Resources'),
  org_id = '11111111-1111-1111-1111-111111111111'
WHERE email = 'mlotshwasine1@gmail.com';

-- If the above email doesn't work, first find your actual email:
SELECT id, email, name, role FROM users;
```

### Step 3: Create Test Organization (if needed)
If you don't have a test organization, create it:

```sql
-- Create test organization
INSERT INTO organizations (id, name, slug)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test Company',
  'test-company'
)
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Create a Second Test User (Optional)
To test both dashboards, you need two users with different roles:

1. **First, create a new auth user:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User"
   - Email: `test-employee@example.com`
   - Password: `password123`
   - Copy the User UUID that's displayed

2. **Then insert into users table:**
```sql
INSERT INTO users (id, org_id, email, name, role, department, is_active)
VALUES (
  'PASTE_THE_UUID_HERE',  -- From step above
  '11111111-1111-1111-1111-111111111111',
  'test-employee@example.com',
  'Test Employee',
  'employee',
  'Operations',
  true
);
```

### Step 5: Test
1. Log out of your current session
2. Log in with `mlotshwasine1@gmail.com` - should go to HR dashboard
3. Log out and log in with `test-employee@example.com` - should go to Employee dashboard

## Verify the Fix

Run this query to see all users and their roles:

```sql
SELECT 
  id, 
  email, 
  name, 
  role, 
  department,
  org_id
FROM users;
```

You should see:
- `mlotshwasine1@gmail.com` with role = `hr`
- `test-employee@example.com` with role = `employee`

## What Was Fixed

1. ✅ **Middleware** - Now checks user role before redirecting
2. ✅ **Root page** - Now checks user role before redirecting  
3. ✅ **Login page** - Already had role-based redirect logic

## Next Steps

If you still see "Not set" after running the SQL:
1. Check that the SQL actually ran (look for confirmation message)
2. Hard refresh your browser (Ctrl+F5)
3. Clear your browser cache
4. Log out and log back in




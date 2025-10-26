# Test Users Guide for Flow4Ops

This guide will help you create test users to view both the Employee and HR dashboards.

## Method 1: Sign Up in the App (Easiest)

### 1. Sign up for Employee User

Go to your app's sign up page and create an account:

**Credentials:**
- Email: `employee@testcompany.com`
- Password: `employee123` (or your choice)

Then update the database to set the user properties:

```sql
-- Run this in Supabase SQL Editor after sign up
UPDATE users 
SET 
  name = 'John Employee', 
  department = 'Operations',
  org_id = '11111111-1111-1111-1111-111111111111'
WHERE email = 'employee@testcompany.com';
```

### 2. Sign up for HR User

Go to your app's sign up page and create another account:

**Credentials:**
- Email: `hr@testcompany.com`
- Password: `hr12345` (or your choice)

Then update the database:

```sql
-- Run this in Supabase SQL Editor after sign up
UPDATE users 
SET 
  name = 'Sarah HR Manager', 
  role = 'hr',
  department = 'Human Resources',
  org_id = '11111111-1111-1111-1111-111111111111'
WHERE email = 'hr@testcompany.com';
```

### 3. Create Sample Compliance Requests (Optional)

```sql
-- Insert sample compliance requests
INSERT INTO compliance_requests (org_id, title, description, form_type, due_date)
VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Annual EEA1 Form Submission',
    'Please complete and submit your annual EEA1 Employment Equity Act declaration form.',
    'eea1',
    CURRENT_DATE + INTERVAL '30 days'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Disclosure of Interest Declaration',
    'Annual declaration of any conflicts of interest or financial interests.',
    'disclosure_of_interest',
    CURRENT_DATE + INTERVAL '45 days'
  );
```

---

## Method 2: Use the TypeScript Script

### Prerequisites

Make sure you have a `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Run the Script

```bash
# Install TypeScript runner if not already installed
npm install -g tsx

# Run the script
npx tsx scripts/create-test-users.ts
```

This will automatically create both users and sample compliance requests.

---

## Method 3: Manual SQL Insert

### Step 1: Create Authentication Users

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" or use the sign up flow in your app
3. Create two users:
   - `employee@testcompany.com` with password `employee123`
   - `hr@testcompany.com` with password `hr12345`

### Step 2: Get User IDs

1. Go to Supabase Dashboard → Authentication → Users
2. Click on each user and copy their UUID
3. Note the UUIDs for the next step

### Step 3: Insert into Users Table

Run this SQL in Supabase SQL Editor (replace UUIDs with actual ones):

```sql
-- Insert Employee User
INSERT INTO users (id, org_id, email, name, role, department, is_active)
VALUES (
  'PASTE_EMPLOYEE_UUID_HERE',
  '11111111-1111-1111-1111-111111111111',
  'employee@testcompany.com',
  'John Employee',
  'employee',
  'Operations',
  true
);

-- Insert HR User
INSERT INTO users (id, org_id, email, name, role, department, is_active)
VALUES (
  'PASTE_HR_UUID_HERE',
  '11111111-1111-1111-1111-111111111111',
  'hr@testcompany.com',
  'Sarah HR Manager',
  'hr',
  'Human Resources',
  true
);
```

---

## Verify Users

Run this query to verify the users were created:

```sql
SELECT 
  u.id, 
  u.email, 
  u.name, 
  u.role, 
  u.department, 
  u.is_active,
  o.name as organization
FROM users u
LEFT JOIN organizations o ON u.org_id = o.id
ORDER BY u.created_at DESC;
```

You should see both users listed.

---

## Login and Test

### Employee Dashboard
- URL: `http://localhost:3000/employee/dashboard`
- Login with: `employee@testcompany.com` / `employee123`
- View: All compliance requests assigned to them

### HR Dashboard  
- URL: `http://localhost:3000/hr/dashboard`
- Login with: `hr@testcompany.com` / `hr12345`
- View: All compliance requests with completion stats, employee submissions, and "Send Reminder" buttons

---

## Troubleshooting

### User can't access HR dashboard
- Check that the `role` field is set to `'hr'` in the database
- Verify the user is in the same organization

### User sees "No active compliance requests"
- Make sure you created compliance requests with `due_date` in the future
- Check that requests are in the same `org_id`

### Row Level Security errors
- Verify RLS policies are enabled and allow the operations
- Check that users are properly linked to organizations


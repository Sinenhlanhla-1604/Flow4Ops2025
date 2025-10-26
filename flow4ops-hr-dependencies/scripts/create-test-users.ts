// ============================================
// CREATE TEST USERS FOR FLOW4OPS
// ============================================
// 
// To run this script:
// 1. Install dependencies: npm install
// 2. Set your Supabase service role key in .env.local
// 3. Run: npx tsx scripts/create-test-users.ts

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');

  // Create Employee User
  console.log('Creating employee user...');
  const { data: empUser, error: empAuthError } = await supabase.auth.admin.createUser({
    email: 'employee@testcompany.com',
    password: 'employee123',
    email_confirm: true,
  });

  if (empAuthError) {
    console.error('❌ Error creating employee auth:', empAuthError);
  } else if (empUser?.user) {
    console.log('✅ Employee auth created:', empUser.user.email);
    
    const { error: empDbError } = await supabase.from('users').insert({
      id: empUser.user.id,
      org_id: '11111111-1111-1111-1111-111111111111',
      email: 'employee@testcompany.com',
      name: 'John Employee',
      role: 'employee',
      department: 'Operations',
      is_active: true,
    });

    if (empDbError) {
      console.error('❌ Error creating employee in DB:', empDbError);
    } else {
      console.log('✅ Employee created in database\n');
    }
  }

  // Create HR User
  console.log('Creating HR user...');
  const { data: hrUser, error: hrAuthError } = await supabase.auth.admin.createUser({
    email: 'hr@testcompany.com',
    password: 'hr12345',
    email_confirm: true,
  });

  if (hrAuthError) {
    console.error('❌ Error creating HR auth:', hrAuthError);
  } else if (hrUser?.user) {
    console.log('✅ HR auth created:', hrUser.user.email);
    
    const { error: hrDbError } = await supabase.from('users').insert({
      id: hrUser.user.id,
      org_id: '11111111-1111-1111-1111-111111111111',
      email: 'hr@testcompany.com',
      name: 'Sarah HR Manager',
      role: 'hr',
      department: 'Human Resources',
      is_active: true,
    });

    if (hrDbError) {
      console.error('❌ Error creating HR in DB:', hrDbError);
    } else {
      console.log('✅ HR user created in database\n');
    }
  }

  // Create sample compliance requests
  console.log('Creating sample compliance requests...');
  const { error: requestsError } = await supabase.from('compliance_requests').insert([
    {
      org_id: '11111111-1111-1111-1111-111111111111',
      title: 'Annual EEA1 Form Submission',
      description: 'Please complete and submit your annual EEA1 Employment Equity Act declaration form.',
      form_type: 'eea1',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    {
      org_id: '11111111-1111-1111-1111-111111111111',
      title: 'Disclosure of Interest Declaration',
      description: 'Annual declaration of any conflicts of interest or financial interests.',
      form_type: 'disclosure_of_interest',
      due_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  ]);

  if (requestsError) {
    console.error('❌ Error creating compliance requests:', requestsError);
  } else {
    console.log('✅ Sample compliance requests created\n');
  }

  console.log('✨ Done! You can now login with:');
  console.log('   Employee: employee@testcompany.com / employee123');
  console.log('   HR:       hr@testcompany.com / hr12345');
}

createTestUsers().catch(console.error);


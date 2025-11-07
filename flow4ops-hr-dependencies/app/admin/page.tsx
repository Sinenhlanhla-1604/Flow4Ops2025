// app/admin/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (!user || authError) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role, first_name, email')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  const { data: analytics } = await supabase
    .from('super_admin_analytics')
    .select('*')
    .single()

  const { data: organizations } = await supabase
    .from('super_admin_organization_details')
    .select('*')
    .order('created_at', { ascending: false})

  // ✅ SERVER ACTION for signout
  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Flow4 Super Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {userData?.first_name || userData?.email}
              </span>
              {/* ✅ FIXED: Server action instead of API route */}
              <form action={handleSignOut}>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500">Total Organizations</dt>
                <dd className="mt-1 text-3xl font-semibold">{analytics?.total_organizations || 0}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500">Active Trials</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">{analytics?.active_trials || 0}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500">Paying Customers</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{analytics?.paying_customers || 0}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                <dd className="mt-1 text-3xl font-semibold">{analytics?.total_users || 0}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Organizations list - add your content here */}
      </main>
    </div>
  )
}
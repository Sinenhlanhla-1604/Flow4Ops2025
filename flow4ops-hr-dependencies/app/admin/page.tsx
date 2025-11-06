// app/admin/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // If not authenticated, redirect to login
  if (!user || authError) {
    redirect('/login')
  }

  // Verify user is super_admin
  const { data: userData } = await supabase
    .from('users')
    .select('role, first_name, last_name')
    .eq('id', user.id)
    .single()

  // Only super_admin can access this page
  if (userData?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  // Get system analytics
  const { data: analytics } = await supabase
    .from('super_admin_analytics')
    .select('*')
    .single()

  // Get all organizations
  const { data: organizations } = await supabase
    .from('super_admin_organization_details')
    .select('*')
    .order('created_at', { ascending: false })

  // Get trial expiry alerts
  const { data: expiryAlerts } = await supabase
    .from('super_admin_expiry_alerts')
    .select('*')
    .order('trial_expires_at', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
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
                {userData?.first_name} {userData?.last_name}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* System Overview Stats */}
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Organizations */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Organizations
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {analytics?.total_organizations || 0}
                </dd>
              </div>
            </div>

            {/* Active Trials */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Trials
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">
                  {analytics?.active_trials || 0}
                </dd>
              </div>
            </div>

            {/* Paying Customers */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Paying Customers
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">
                  {analytics?.active_organizations || 0}
                </dd>
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Users
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {analytics?.total_users || 0}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Expiry Alerts */}
        {expiryAlerts && expiryAlerts.length > 0 && (
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              ⚠️ Trial Expiry Alerts ({expiryAlerts.length})
            </h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {expiryAlerts.map((alert) => (
                  <li key={alert.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {alert.total_users} users • {alert.contact_email}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            alert.alert_level === 'urgent'
                              ? 'bg-red-100 text-red-800'
                              : alert.alert_level === 'warning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {Math.floor(alert.days_remaining)} days left
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* All Organizations */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              All Organizations
            </h2>
            <a
              href="/admin/organizations/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              + New Organization
            </a>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {organizations && organizations.length > 0 ? (
                organizations.map((org) => (
                  <li key={org.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {org.name}
                          </p>
                          <div className="ml-2 shrink-0 flex">
                            <p
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                org.status_label === 'Active Trial'
                                  ? 'bg-blue-100 text-blue-800'
                                  : org.status_label === 'Paying Customer'
                                  ? 'bg-green-100 text-green-800'
                                  : org.status_label === 'Trial Expired'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {org.status_label}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {org.total_users} users • {org.hr_users} HR • {org.managers} managers
                            </p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <p>
                              Created: {new Date(org.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-12 text-center">
                  <p className="text-sm text-gray-500">
                    No organizations yet. Create your first one!
                  </p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
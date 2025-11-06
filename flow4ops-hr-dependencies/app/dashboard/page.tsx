// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // If not authenticated, redirect to login
  if (!user || authError) {
    redirect('/login')
  }

  // Get user data including role
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('role, org_id, first_name, last_name')
    .eq('id', user.id)
    .single()

  // If error fetching user data, show error
  if (userDataError) {
    console.error('Error fetching user data:', userDataError)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
          <p className="text-gray-600 mb-4">
            Could not load your user profile. This might be a permissions issue.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Error: {userDataError.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  // Route based on role
  const role = userData?.role

  if (role === 'super_admin') {
    // Super admin goes to admin dashboard
    redirect('/admin')
  } else if (role === 'hr') {
    // HR goes to HR dashboard
    redirect('/hr/dashboard')
  } else if (role === 'manager') {
    // Manager gets choice prompt (we'll build this later)
    redirect('/employee/dashboard') // For now, go to employee
  } else {
    // Regular employee goes to employee dashboard
    redirect('/employee/dashboard')
  }

  return null
}
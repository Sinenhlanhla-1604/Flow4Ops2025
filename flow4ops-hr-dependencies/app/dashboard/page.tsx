// app/dashboard/page.tsx
// ✅ FIXED VERSION - Handles super_admin routing properly
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
       
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

 
  if (!userData) {
    console.error('User data not found in database')
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">
            Your user profile doesn't exist in the system yet.
          </p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  // Route based on role
  const role = userData.role

  if (role === 'super_admin') {
    // Super admin goes to admin dashboard
    redirect('/admin')
  } else if (role === 'hr') {
    // HR goes to HR dashboard
    redirect('/hr/dashboard')
  } else if (role === 'manager') {
    // Manager gets employee dashboard with enhanced permissions
    redirect('/employee/dashboard')
  } else if (role === 'employee') {
    // Regular employee goes to employee dashboard
    redirect('/employee/dashboard')
  } else {
    // Unknown role - show error
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Role</h1>
          <p className="text-gray-600 mb-4">
            Your account has an invalid role: {role}
          </p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return null
}
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If no user or auth error, go to login
  if (!user || error) {
    redirect('/login')
  }

  // Fetch user role from database
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // If error fetching user data, show error (don't default to employee)
  if (userDataError) {
    console.error('Error fetching user data:', userDataError)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
          <p className="text-zinc-400 mb-4">Could not load your user profile. This might be a permissions issue.</p>
          <p className="text-sm text-zinc-500">Error: {userDataError.message}</p>
        </div>
      </div>
    )
  }

  // Redirect based on role
  if (userData?.role === 'hr' || userData?.role === 'admin') {
    redirect('/hr/dashboard')
  } else {
    redirect('/employee/dashboard')
  }
}
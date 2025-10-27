import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // If not authenticated, go to login
  if (!user || error) {
    redirect('/login')
  }

  // Get user role and redirect appropriately
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // If can't get user data, go to dashboard to let it handle the role check
  if (userDataError || !userData?.role) {
    redirect('/dashboard')
  }

  // Redirect based on role
  if (userData.role === 'hr' || userData.role === 'admin') {
    redirect('/hr/dashboard')
  } else {
    redirect('/employee/dashboard')
  }
}
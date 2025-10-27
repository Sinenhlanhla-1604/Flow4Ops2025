// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // DEBUG - Remove after testing
  console.log('User email:', user.email)
  console.log('User role from database:', userData?.role)
  console.log('Will redirect to:', userData?.role === 'hr' ? '/hr/dashboard' : '/employee/dashboard')

  // Redirect based on role
  if (userData?.role === 'hr' || userData?.role === 'admin') {
    redirect('/hr/dashboard')
  } else {
    redirect('/employee/dashboard')
  }
}
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase-server'  // Changed import path
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get user role to redirect appropriately
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      // Redirect based on role
      const redirectPath = userData?.role === 'hr' || userData?.role === 'admin' 
        ? '/hr/dashboard' 
        : '/employee/dashboard'
      
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  // Default redirect to employee dashboard after email confirmation
  return NextResponse.redirect(new URL('/employee/dashboard', request.url))
}
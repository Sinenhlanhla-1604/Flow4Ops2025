// app/dashboard/page.tsx
// ✅ FIXED: Proper redirects + better error handling
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (!user || authError) {
          console.log('Not authenticated, redirecting to login')
          router.push('/login')
          return
        }

        console.log('Authenticated user ID:', user.id)

        // Get user data including role
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('role, org_id, first_name, email')
          .eq('id', user.id)
          .single()

        if (userDataError) {
          console.error('Error fetching user data:', userDataError)
          setError(`Database error: ${userDataError.message}`)
          setLoading(false)
          return
        }

        if (!userData) {
          console.error('User data not found in database')
          setError('Your profile was not found in the system')
          setLoading(false)
          return
        }

        console.log('User data loaded:', userData)

        // Route based on role
        const role = userData.role

        if (role === 'super_admin') {
          console.log('Redirecting super_admin to /admin')
          router.push('/admin')
        } else if (role === 'hr') {
          console.log('Redirecting hr to /hr/dashboard')
          router.push('/hr/dashboard')
        } else if (role === 'manager' || role === 'employee') {
          console.log('Redirecting to /employee/dashboard')
          router.push('/employee/dashboard')
        } else {
          setError(`Unknown role: ${role}`)
          setLoading(false)
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Login
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
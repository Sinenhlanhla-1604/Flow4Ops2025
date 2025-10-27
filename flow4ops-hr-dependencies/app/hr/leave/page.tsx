// app/hr/leave/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HRLeavePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('name, role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'hr' && userData?.role !== 'admin') {
    redirect('/employee/dashboard')
  }

  // Get all leave requests with employee info
  const { data: leaveRequests } = await supabase
    .from('leave_requests')
    .select(`
      *,
      employee:users!leave_requests_employee_id_fkey(name, email, department)
    `)
    .order('created_at', { ascending: false })

  // Calculate stats
  const pendingCount = leaveRequests?.filter(r => r.status === 'pending').length || 0
  const approvedCount = leaveRequests?.filter(r => r.status === 'approved').length || 0
  const deniedCount = leaveRequests?.filter(r => r.status === 'denied').length || 0

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/40 bg-zinc-950/95 backdrop-blur">
        <div className="container flex h-14 max-w-screen-2xl mx-auto items-center">
          <div className="mr-4 flex">
            <Link href="/hr/dashboard" className="mr-6 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 font-bold text-sm">F4</div>
              <span className="font-bold">Flow4Ops</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/hr/dashboard" className="text-zinc-400 transition-colors hover:text-zinc-100">Home</Link>
              <Link href="/hr/compliance" className="text-zinc-400 transition-colors hover:text-zinc-100">Compliance</Link>
              <Link href="/hr/leave" className="text-emerald-400 transition-colors">Leave</Link>
              <Link href="/hr/surveys" className="text-zinc-400 transition-colors hover:text-zinc-100">Surveys</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500">HR Manager</p>
                <p className="text-sm font-medium">{userData?.name || user.email?.split('@')[0]}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-medium">
                {user.email?.[0].toUpperCase()}
              </div>
              <form action={signOut}>
                <button className="text-sm text-zinc-400 hover:text-zinc-100">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container max-w-screen-2xl mx-auto py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
              <p className="text-zinc-400">Review and approve employee leave requests</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Pending</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold">{pendingCount}</div>
              <p className="text-xs text-zinc-500 mt-1">Awaiting review</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Approved</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold">{approvedCount}</div>
              <p className="text-xs text-zinc-500 mt-1">Leave granted</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Denied</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold">{deniedCount}</div>
              <p className="text-xs text-zinc-500 mt-1">Not approved</p>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Leave Requests</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Employee</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Leave Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Dates</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Days</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {leaveRequests?.map((request) => (
                      <tr key={request.id} className="hover:bg-zinc-800/30">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium">{request.employee?.name || 'Unknown'}</div>
                            <div className="text-xs text-zinc-500">{request.employee?.department}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="capitalize text-sm">{request.leave_type.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-4 text-sm text-zinc-400">
                          {new Date(request.start_date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })} - {new Date(request.end_date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-4 text-sm">{request.days_requested}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                            request.status === 'approved' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : request.status === 'denied'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {request.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button className="inline-flex h-8 items-center justify-center rounded-md bg-emerald-500/10 border border-emerald-500/20 px-3 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20">
                                Approve
                              </button>
                              <button className="inline-flex h-8 items-center justify-center rounded-md bg-red-500/10 border border-red-500/20 px-3 text-xs font-medium text-red-400 hover:bg-red-500/20">
                                Deny
                              </button>
                            </div>
                          )}
                          {request.status !== 'pending' && (
                            <span className="text-xs text-zinc-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {(!leaveRequests || leaveRequests.length === 0) && (
                <div className="py-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-zinc-500">No leave requests yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
// app/employee/leave/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EmployeeLeavePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('name, role, annual_leave_total, annual_leave_used, sick_leave_total, sick_leave_used')
    .eq('id', user.id)
    .single()

  // Get user's leave requests
  const { data: leaveRequests } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate remaining leave
  const annualRemaining = (userData?.annual_leave_total || 0) - (userData?.annual_leave_used || 0)
  const sickRemaining = (userData?.sick_leave_total || 0) - (userData?.sick_leave_used || 0)
  const pendingRequests = leaveRequests?.filter(r => r.status === 'pending').length || 0

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
            <Link href="/employee/dashboard" className="mr-6 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 font-bold text-sm">F4</div>
              <span className="font-bold">Flow4Ops</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/employee/dashboard" className="text-zinc-400 transition-colors hover:text-zinc-100">Home</Link>
              <Link href="/employee/compliance" className="text-zinc-400 transition-colors hover:text-zinc-100">Compliance</Link>
              <Link href="/employee/leave" className="text-emerald-400 transition-colors">Leave</Link>
              <Link href="/employee/surveys" className="text-zinc-400 transition-colors hover:text-zinc-100">Surveys</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500">Employee</p>
                <p className="text-sm font-medium">{userData?.name || user.email?.split('@')[0]}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium">
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
              <h2 className="text-2xl font-bold tracking-tight">My Leave Requests</h2>
              <p className="text-zinc-400">Request time off and track approval status</p>
            </div>
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-medium hover:bg-violet-500">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request Leave
            </button>
          </div>

          {/* Leave Balance Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Annual Leave</h3>
                <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{annualRemaining} days</div>
              <p className="text-xs text-zinc-500">
                {userData?.annual_leave_used || 0} of {userData?.annual_leave_total || 0} used
              </p>
              {/* Progress bar */}
              <div className="mt-3 w-full bg-zinc-800 rounded-full h-1.5">
                <div 
                  className="bg-blue-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${((userData?.annual_leave_used || 0) / (userData?.annual_leave_total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Sick Leave</h3>
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{sickRemaining} days</div>
              <p className="text-xs text-zinc-500">
                {userData?.sick_leave_used || 0} of {userData?.sick_leave_total || 0} used
              </p>
              {/* Progress bar */}
              <div className="mt-3 w-full bg-zinc-800 rounded-full h-1.5">
                <div 
                  className="bg-emerald-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${((userData?.sick_leave_used || 0) / (userData?.sick_leave_total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Pending Requests</h3>
                <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{pendingRequests}</div>
              <p className="text-xs text-zinc-500">Awaiting approval</p>
            </div>
          </div>

          {/* Leave Requests */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Leave History</h3>
            
            <div className="grid gap-4">
              {leaveRequests?.map((request) => (
                <div key={request.id} className={`rounded-lg border p-6 ${
                  request.status === 'approved'
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : request.status === 'denied'
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-zinc-800 bg-zinc-900/50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold capitalize">{request.leave_type} Leave</h3>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          request.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : request.status === 'denied'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        } capitalize`}>
                          {request.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-zinc-400 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(request.start_date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })} - {new Date(request.end_date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1 font-medium">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {request.days_requested} {request.days_requested === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                      
                      {request.reason && (
                        <p className="text-sm text-zinc-500 mb-2">
                          <span className="font-medium text-zinc-400">Reason:</span> {request.reason}
                        </p>
                      )}

                      {request.notes && request.status !== 'pending' && (
                        <div className={`mt-3 p-3 rounded-lg ${
                          request.status === 'approved'
                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                            : 'bg-red-500/10 border border-red-500/20'
                        }`}>
                          <p className="text-xs font-medium text-zinc-400 mb-1">HR Notes:</p>
                          <p className="text-sm">{request.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 text-xs text-zinc-500">
                        Requested {new Date(request.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {(!leaveRequests || leaveRequests.length === 0) && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">No Leave Requests</h3>
                  <p className="text-sm text-zinc-400 mb-4">You haven't requested any leave yet</p>
                  <button className="inline-flex h-9 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-medium hover:bg-violet-500">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Request Leave
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
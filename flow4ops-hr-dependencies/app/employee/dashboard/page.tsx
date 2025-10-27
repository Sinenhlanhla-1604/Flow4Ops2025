// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('name, role, department, annual_leave_total, annual_leave_used, sick_leave_total, sick_leave_used')
    .eq('id', user.id)
    .single()

  const { data: requests } = await supabase
    .from('compliance_requests')
    .select('*')
    .gte('due_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false })

  const { data: submissions } = await supabase
    .from('compliance_submissions')
    .select('id, request_id')
    .eq('employee_id', user.id)

  // Get leave data
  const { data: leaveRequests } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('employee_id', user.id)
  
  const annualRemaining = (userData?.annual_leave_total || 0) - (userData?.annual_leave_used || 0)
  const sickRemaining = (userData?.sick_leave_total || 0) - (userData?.sick_leave_used || 0)
  const pendingLeaveRequests = leaveRequests?.filter(r => r.status === 'pending').length || 0

  // Create a map of submitted request IDs
  const submittedRequestIds = new Set(submissions?.map(s => s.request_id) || [])

  const totalRequests = requests?.length || 0
  const completedSubmissions = submissions?.length || 0
  const pendingSubmissions = totalRequests - completedSubmissions

  // Format display names for request types
  const getDisplayName = (formType: string) => {
    const names: Record<string, string> = {
      'eea1': 'EEA1 Form',
      'disclosure_of_interest': 'Disclosure of Interest',
      'policy_acknowledgment': 'Policy Acknowledgment'
    }
    return names[formType] || formType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getFormTypeColor = (formType: string) => {
    const colors: Record<string, string> = {
      'eea1': 'violet',
      'disclosure_of_interest': 'blue',
      'policy_acknowledgment': 'emerald'
    }
    return colors[formType] || 'zinc'
  }

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/40 bg-zinc-950/95 backdrop-blur supports-backdrop-filter:bg-zinc-950/60">
        <div className="container flex h-14 max-w-screen-2xl mx-auto items-center">
          <div className="mr-4 flex">
            <Link href="/employee/dashboard" className="mr-6 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-600 font-bold text-sm">F4</div>
              <span className="font-bold">Flow4Ops</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/employee/dashboard" className="text-emerald-400 transition-colors">Home</Link>
              <Link href="/employee/compliance" className="text-zinc-400 transition-colors hover:text-zinc-100">Compliance</Link>
              <Link href="/employee/leave" className="text-zinc-400 transition-colors hover:text-zinc-100">Leave</Link>
              <Link href="/employee/surveys" className="text-zinc-400 transition-colors hover:text-zinc-100">Surveys</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="ml-2 flex items-center space-x-3 border-l border-zinc-800 pl-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-medium">
                  {user.email?.[0].toUpperCase()}
                </div>
                <form action={signOut}>
                  <button className="text-sm text-zinc-400 hover:text-zinc-100">Sign out</button>
                </form>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container max-w-screen-2xl mx-auto py-6">
          {/* Page Header */}
          <div className="flex items-center justify-between space-y-2 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
              <p className="text-zinc-400">Welcome back, {userData?.name || user.email?.split('@')[0]}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 text-sm font-medium hover:bg-zinc-800">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                This Month
              </button>
              <button className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 text-sm font-medium hover:bg-zinc-800">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Total Forms</h3>
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-zinc-500">Required submissions</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Completed</h3>
                <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{completedSubmissions}</div>
              <p className="text-xs text-emerald-400">All forms submitted</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Pending</h3>
                <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{pendingSubmissions}</div>
              <p className="text-xs text-amber-400">Action required</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Profile</h3>
                <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-lg font-semibold">{userData?.role || 'Employee'}</div>
              <p className="text-xs text-zinc-500">{userData?.department || 'Not assigned'}</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 space-y-4">
              {/* Leave Stats */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Leave Balance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-zinc-400">Annual Leave</h4>
                        <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold">{annualRemaining} days</div>
                      <p className="text-xs text-zinc-500">
                        {userData?.annual_leave_used || 0} of {userData?.annual_leave_total || 0} used
                      </p>
                      <div className="mt-2 w-full bg-zinc-800 rounded-full h-1.5">
                        <div 
                          className="bg-blue-400 h-1.5 rounded-full"
                          style={{ width: `${((userData?.annual_leave_used || 0) / (userData?.annual_leave_total || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-zinc-400">Sick Leave</h4>
                        <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="text-2xl font-bold">{sickRemaining} days</div>
                      <p className="text-xs text-zinc-500">
                        {userData?.sick_leave_used || 0} of {userData?.sick_leave_total || 0} used
                      </p>
                      <div className="mt-2 w-full bg-zinc-800 rounded-full h-1.5">
                        <div 
                          className="bg-emerald-400 h-1.5 rounded-full"
                          style={{ width: `${((userData?.sick_leave_used || 0) / (userData?.sick_leave_total || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {pendingLeaveRequests > 0 && (
                    <div className="mt-4 rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-amber-400">
                          {pendingLeaveRequests} {pendingLeaveRequests === 1 ? 'request' : 'requests'} pending approval
                        </p>
                        <Link href="/employee/leave" className="text-xs text-amber-400 hover:text-amber-300">View →</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300">View all</button>
                  </div>
                  <div className="flex h-[200px] items-center justify-center text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-10 w-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm text-zinc-500">No recent activity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-3 space-y-4">
              {/* Quick Actions */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/compliance/submit" className="flex items-center space-x-4 rounded-md border border-zinc-800 p-4 hover:border-emerald-500/50 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10">
                        <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Submit Forms</p>
                        <p className="text-xs text-zinc-500">Upload documents</p>
                      </div>
                    </Link>
                    {userData?.role === 'hr' && (
                      <Link href="/hr/compliance" className="flex items-center space-x-4 rounded-md border border-zinc-800 p-4 hover:border-blue-500/50 transition-colors">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500/10">
                          <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">HR Dashboard</p>
                          <p className="text-xs text-zinc-500">View team status</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              {totalRequests > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
                    <div className="space-y-2">
                      {requests?.map((request) => {
                        const hasSubmitted = submittedRequestIds.has(request.id)
                        if (!hasSubmitted) {
                          const daysUntilDue = Math.ceil(
                            (new Date(request.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                          )
                          return (
                            <div key={request.id} className="rounded-md border border-amber-500/20 bg-amber-500/5 p-4">
                              <div className="flex items-start justify-between mb-1">
                                <p className="text-sm font-medium">{getDisplayName(request.form_type)}</p>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                  daysUntilDue <= 3 
                                    ? 'bg-red-500/10 text-red-400' 
                                    : daysUntilDue <= 7 
                                    ? 'bg-amber-500/10 text-amber-400' 
                                    : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                  {daysUntilDue <= 3 ? 'Urgent' : daysUntilDue <= 7 ? 'Soon' : 'Upcoming'}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400">Due {new Date(request.due_date).toLocaleDateString()}</p>
                            </div>
                          )
                        }
                        return null
                      })}
                      {requests?.every(r => submittedRequestIds.has(r.id)) && (
                        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4">
                          <p className="text-sm font-medium text-emerald-400">All forms completed! ✓</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
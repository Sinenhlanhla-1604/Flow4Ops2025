// app/hr/dashboard/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HRDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('name, role')
    .eq('id', user.id)
    .single()

  // Only HR/Admin can access
  if (userData?.role !== 'hr' && userData?.role !== 'admin') {
    redirect('/employee/dashboard')
  }

  // Get all employees
  const { data: allEmployees } = await supabase
    .from('users')
    .select('id, name, email, department')
    .eq('is_active', true)

  const totalEmployees = allEmployees?.length || 0

  // Get all active compliance requests (not just EEA1)
  const { data: requests } = await supabase
    .from('compliance_requests')
    .select('*')
    .gte('due_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false })

  // Get all submissions
  const { data: allSubmissions } = await supabase
    .from('compliance_submissions')
    .select('request_id, employee_id, submitted_at, file_url')

  // Create lookup map for submissions
  const submissionMap = new Map(allSubmissions?.map(s => [`${s.request_id}-${s.employee_id}`, s]) || [])

  // Process each compliance request type
  const requestStats = requests?.map(request => {
    const submissions = allSubmissions?.filter(s => s.request_id === request.id) || []
    const submittedCount = submissions.length
    const pendingCount = totalEmployees - submittedCount
    const completionRate = totalEmployees > 0 ? Math.round((submittedCount / totalEmployees) * 100) : 0
    
    return {
      ...request,
      submittedCount,
      pendingCount,
      completionRate,
      isActive: true
    }
  }) || []

  // Format display names
  const getDisplayName = (formType: string) => {
    const names: Record<string, string> = {
      'eea1': 'EEA1 Form',
      'disclosure_of_interest': 'Disclosure of Interest',
      'policy_acknowledgment': 'Policy Acknowledgment'
    }
    return names[formType] || formType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Calculate overall stats
  const activeRequestsCount = requestStats.length
  const totalSubmitted = requestStats.reduce((sum, r) => sum + r.submittedCount, 0)
  const totalPending = requestStats.reduce((sum, r) => sum + r.pendingCount, 0)
  const avgCompletionRate = activeRequestsCount > 0 
    ? Math.round(requestStats.reduce((sum, r) => sum + r.completionRate, 0) / activeRequestsCount)
    : 0

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
              <Link href="/hr/dashboard" className="text-emerald-400 transition-colors">HR Dashboard</Link>
              <Link href="/hr/compliance" className="text-zinc-400 transition-colors hover:text-zinc-100">Compliance</Link>
              <Link href="/hr/requests/new" className="text-zinc-400 transition-colors hover:text-zinc-100">New Request</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4">
              <div className="text-right">
                <p className="text-xs text-zinc-500">Logged in as</p>
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
              <h2 className="text-2xl font-bold tracking-tight">HR Dashboard</h2>
              <p className="text-zinc-400">Manage compliance requests and track employee submissions</p>
            </div>
            <Link 
              href="/hr/requests/new"
              className="inline-flex h-9 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-medium hover:bg-violet-500"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Request
            </Link>
          </div>

          {/* Overall Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Total Employees</h3>
                <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-zinc-500">Active staff members</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Active Requests</h3>
                <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{activeRequestsCount}</div>
              <p className="text-xs text-zinc-500">Compliance requests</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Total Submitted</h3>
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{totalSubmitted}</div>
              <p className="text-xs text-emerald-400">Forms received</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-zinc-400">Avg. Completion</h3>
                <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold">{avgCompletionRate}%</div>
              <p className="text-xs text-zinc-500">Overall progress</p>
            </div>
          </div>

          {/* Compliance Request Cards */}
          {requestStats.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-16 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl text-zinc-400 mb-2">No active compliance requests</p>
              <p className="text-sm text-zinc-500">Create a new request to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requestStats.map((request) => (
                <div key={request.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{getDisplayName(request.form_type)}</h3>
                      <p className="text-sm text-zinc-400">{request.description || 'Compliance request'}</p>
                      <p className="text-xs text-zinc-500 mt-1">Due: {new Date(request.due_date).toLocaleDateString()}</p>
                    </div>
                    {request.pendingCount > 0 && (
                      <button className="inline-flex h-9 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 px-4 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition-colors">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Reminder ({request.pendingCount})
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                      <div className="text-sm text-zinc-400 mb-1">Completion</div>
                      <div className="text-2xl font-bold">{request.submittedCount}/{totalEmployees} ({request.completionRate}%)</div>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                      <div className="text-sm text-zinc-400 mb-1">Submitted</div>
                      <div className="text-2xl font-bold text-emerald-400">{request.submittedCount}</div>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                      <div className="text-sm text-zinc-400 mb-1">Pending</div>
                      <div className="text-2xl font-bold text-amber-400">{request.pendingCount}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span>Progress</span>
                      <span>{request.completionRate}% Complete</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-600 transition-all duration-500"
                        style={{ width: `${request.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Employee List */}
                  <details className="border-t border-zinc-800 pt-4">
                    <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                      View all employee submissions ({totalEmployees} total)
                    </summary>
                    <div className="mt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-zinc-800">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Department</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Submitted</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                            {allEmployees?.map((employee) => {
                              const submission = submissionMap.get(`${request.id}-${employee.id}`)
                              const hasSubmitted = !!submission

                              return (
                                <tr key={employee.id} className="hover:bg-zinc-800/50">
                                  <td className="px-4 py-3 text-sm font-medium">{employee.name || 'N/A'}</td>
                                  <td className="px-4 py-3 text-sm text-zinc-400">{employee.email}</td>
                                  <td className="px-4 py-3 text-sm text-zinc-400">{employee.department || 'Not assigned'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                                      hasSubmitted 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                      {hasSubmitted ? '✓ Submitted' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-zinc-400">
                                    {hasSubmitted 
                                      ? new Date(submission.submitted_at).toLocaleDateString() 
                                      : '—'}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
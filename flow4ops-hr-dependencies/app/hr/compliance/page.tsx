// app/hr/compliance/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HRCompliancePage() {
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

  // Get all compliance requests
  const { data: requests } = await supabase
    .from('compliance_requests')
    .select('*')
    .order('created_at', { ascending: false })

  // Get all employees
  const { data: employees } = await supabase
    .from('users')
    .select('id')
    .eq('is_active', true)

  // Get all submissions
  const { data: allSubmissions } = await supabase
    .from('compliance_submissions')
    .select('request_id, employee_id')

  const totalEmployees = employees?.length || 0

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
              <Link href="/hr/dashboard" className="text-zinc-400 transition-colors">Home</Link>
              <Link href="/hr/leave" className="text-zinc-400 transition-colors hover:text-zinc-100">Leave Requests</Link>
              <Link href="/hr/compliance" className="text-zinc-400 transition-colors hover:text-zinc-100">Compliance</Link>
              <Link href="/hr/surveys" className="text-zinc-400 transition-colors hover:text-zinc-100">Surveys</Link>
              <Link href="/hr/payroll" className="text-zinc-400 transition-colors hover:text-zinc-100">Payroll</Link>
              <Link href="/hr/employeeInfo" className="text-zinc-400 transition-colors hover:text-zinc-100">Employees</Link>
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
              <h2 className="text-2xl font-bold tracking-tight">Compliance Management</h2>
              <p className="text-zinc-400">Upload forms and track employee submissions</p>
            </div>
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-medium hover:bg-violet-500">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Compliance Request
            </button>
          </div>

          {/* Compliance Requests */}
          <div className="grid gap-4">
            {requests?.map((request) => {
              const requestSubmissions = allSubmissions?.filter(s => s.request_id === request.id) || []
              const submittedCount = requestSubmissions.length
              const completionRate = totalEmployees > 0 ? Math.round((submittedCount / totalEmployees) * 100) : 0

              return (
                <div key={request.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.title}</h3>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          new Date(request.due_date) < new Date()
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          Due: {new Date(request.due_date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mb-4">{request.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-zinc-400">Completion Progress</span>
                          <span className="text-sm font-semibold">{completionRate}%</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-2">
                          <div 
                            className="bg-linear-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">
                          {submittedCount} of {totalEmployees} employees submitted
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/hr/compliance/${request.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 text-sm font-medium hover:bg-zinc-800"
                    >
                      View Submissions
                    </Link>
                    <button className="inline-flex h-9 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20 px-4 text-sm font-medium text-amber-400 hover:bg-amber-500/20">
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Reminder
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Empty State */}
            {(!requests || requests.length === 0) && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">No Compliance Requests Yet</h3>
                <p className="text-sm text-zinc-400 mb-4">Create your first compliance request to get started</p>
                <button className="inline-flex h-9 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-medium hover:bg-violet-500">
                  Create Compliance Request
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
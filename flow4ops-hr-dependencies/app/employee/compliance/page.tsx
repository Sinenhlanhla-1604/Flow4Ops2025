// app/employee/compliance/page.tsx
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EmployeeCompliancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('name, role')
    .eq('id', user.id)
    .single()

  // Get compliance requests
  const { data: requests } = await supabase
    .from('compliance_requests')
    .select('*')
    .gte('due_date', new Date().toISOString().split('T')[0])
    .order('due_date', { ascending: true })

  // Get user's submissions
  const { data: submissions } = await supabase
    .from('compliance_submissions')
    .select('request_id, submitted_at, file_url')
    .eq('employee_id', user.id)

  const submissionMap = new Map(submissions?.map(s => [s.request_id, s]) || [])

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
              <Link href="/employee/compliance" className="text-emerald-400 transition-colors">Compliance</Link>
              <Link href="/employee/leave" className="text-zinc-400 transition-colors hover:text-zinc-100">Leave</Link>
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
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">My Compliance Forms</h2>
            <p className="text-zinc-400">Download, complete, and submit your required compliance forms</p>
          </div>

          {/* Compliance Forms */}
          <div className="grid gap-4">
            {requests?.map((request) => {
              const submission = submissionMap.get(request.id)
              const hasSubmitted = !!submission
              const isOverdue = new Date(request.due_date) < new Date()

              return (
                <div key={request.id} className={`rounded-lg border p-6 ${
                  hasSubmitted 
                    ? 'border-emerald-500/20 bg-emerald-500/5' 
                    : isOverdue
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-zinc-800 bg-zinc-900/50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{request.title}</h3>
                        {hasSubmitted ? (
                          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                            ✓ Submitted
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 border border-red-500/20">
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-zinc-400 mb-3">{request.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due: {new Date(request.due_date).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        {hasSubmitted && submission && (
                          <div className="flex items-center gap-1">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submitted: {new Date(submission.submitted_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800">
                    <a
                      href="#"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-800 bg-transparent px-4 text-sm font-medium hover:bg-zinc-800"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Form
                    </a>
                    {!hasSubmitted && (
                      <button className="inline-flex h-9 items-center justify-center rounded-md bg-violet-600 px-4 text-sm font-medium hover:bg-violet-500">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Completed Form
                      </button>
                    )}
                    {hasSubmitted && (
                      <button className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20">
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Resubmit Form
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Empty State */}
            {(!requests || requests.length === 0) && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-sm text-zinc-400">You have no pending compliance forms at this time</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
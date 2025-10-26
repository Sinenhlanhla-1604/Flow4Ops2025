// app/compliance/submit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ComplianceRequest {
  id: string;
  title: string;
  description: string;
  due_date: string;
  form_type: string;
  request_id?: string;
}

interface Submission {
  id: string;
  request_id: string;
  submitted_at: string;
  status: string;
}

export default function SubmitCompliancePage() {
  const [requests, setRequests] = useState<ComplianceRequest[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: requestsData } = await supabase
        .from('compliance_requests')
        .select('*')
        .gte('due_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      setRequests(requestsData || []);

      const { data: submissionsData } = await supabase
        .from('compliance_submissions')
        .select('*')
        .eq('employee_id', user.id);

      setSubmissions(submissionsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(requestId: string) {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${requestId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('compliance-forms')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('compliance-forms')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('compliance_submissions')
        .insert({
          request_id: requestId,
          employee_id: user.id,
          file_url: publicUrl,
          status: 'submitted'
        });

      if (dbError) throw dbError;

      alert('Form submitted successfully!');
      setFile(null);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const hasSubmitted = (requestId: string) => {
    return submissions.some(s => s.request_id === requestId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top Navigation */}
      <nav className="border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-sm">
                  F4
                </div>
                <span className="text-xl font-bold">Flow4Ops</span>
              </div>

              <div className="hidden md:flex items-center gap-1">
                <Link 
                  href="/employee/dashboard" 
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition"
                >
                  Overview
                </Link>
                <Link 
                  href="/compliance/submit" 
                  className="px-4 py-2 text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg"
                >
                  Compliance
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-1">Compliance Forms</h1>
            <p className="text-zinc-400">Submit required compliance documents</p>
          </div>

          {/* Forms List */}
          {requests.length === 0 ? (
            <div className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-16 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl text-zinc-400">No active compliance requests</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => {
                const submitted = hasSubmitted(request.id);
                const daysUntilDue = Math.ceil(
                  (new Date(request.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div key={request.id} className="bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-8">
                      <div className="flex items-start justify-between gap-6 mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-semibold">{request.title}</h2>
                            {request.form_type === 'eea1' && (
                              <span className="inline-flex items-center rounded-md bg-violet-500/10 px-2.5 py-0.5 text-xs font-medium text-violet-400 border border-violet-500/20">
                                EEA1
                              </span>
                            )}
                            {request.form_type === 'disclosure_of_interest' && (
                              <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                                Disclosure
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-400 mb-4">{request.description}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-zinc-500">
                            Due {new Date(request.due_date).toLocaleDateString()}
                          </span>
                          {!submitted && daysUntilDue > 0 && (
                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                              daysUntilDue <= 7 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {daysUntilDue} days remaining
                            </span>
                          )}
                        </div>
                      </div>
                      {submitted && (
                        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-medium flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                          Submitted
                        </div>
                      )}
                    </div>

                    {!submitted && (
                      <div className="border-t border-zinc-800/50 pt-6">
                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                          Upload Document
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="flex-1 text-sm text-zinc-400
                              file:mr-4 file:py-2.5 file:px-4 
                              file:rounded-lg file:border file:border-zinc-700
                              file:text-sm file:font-medium 
                              file:bg-zinc-800 file:text-zinc-200
                              hover:file:bg-zinc-750 file:transition-colors
                              file:cursor-pointer"
                          />
                          <button
                            onClick={() => handleSubmit(request.id)}
                            disabled={uploading || !file}
                            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium disabled:opacity-50 transition shadow-lg shadow-violet-500/20"
                          >
                            {uploading ? 'Uploading...' : 'Submit Form'}
                          </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">
                          PDF, DOC, DOCX • Max 5MB
                        </p>
                      </div>
                    )}

                    {submitted && (
                      <div className="border-t border-zinc-800/50 pt-4">
                        <p className="text-sm text-zinc-400">
                          Submitted on {new Date(submissions.find(s => s.request_id === request.id)?.submitted_at || '').toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
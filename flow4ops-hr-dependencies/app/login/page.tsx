// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Get user role to redirect appropriately
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      // Redirect based on role
      const redirectTo = userData?.role === 'hr' || userData?.role === 'admin' 
        ? '/hr/dashboard' 
        : '/employee/dashboard';
      
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-3">Flow4Ops</h1>
          <p className="text-zinc-400 text-lg">Simplify operations. Amplify execution.</p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 rounded-3xl p-10 shadow-2xl shadow-black/20">
          <h2 className="text-2xl font-semibold mb-8">Sign in to your account</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-3">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition"
                placeholder="you@company.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-3">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3.5 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Request Access Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-500">
              Don't have an account?{' '}
              <a 
                href="mailto:hello@flow4ops.com?subject=Request Access to Flow4Ops" 
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                Request access
              </a>
            </p>
          </div>

          {/* Beta Notice */}
          <div className="mt-6 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
            <p className="text-xs text-center text-zinc-400">
               Flow4Ops is currently in private beta. Request access to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
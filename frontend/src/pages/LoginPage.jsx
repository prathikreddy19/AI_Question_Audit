import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, GraduationCap, ArrowRight, Lock, Mail } from 'lucide-react';
import { roleForEmail, useAuth } from '../contexts/AuthContext';

function friendlyAuthError(error) {
  switch (error?.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'The email or password is incorrect. Please try again.';
    case 'auth/user-not-found':
      return 'No account was found for this email address.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Unable to connect. Check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please wait a moment and try again.';
    case 'auth/role-not-assigned':
      return error.message;
    default:
      return 'Sign-in failed. Please try again.';
  }
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectAccount = (selectedRole) => {
    setEmail(selectedRole === 'faculty' ? 'faculty@acadza.com' : 'student@acadza.com');
    setError('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate(roleForEmail(email) === 'faculty' ? '/faculty' : '/student', { replace: true });
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-slate-900">Sign in to console</h2>
        <p className="text-xs text-slate-500">
          Sign in with your Acadza account
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="faculty@acadza.com or student@acadza.com"
              autoComplete="username"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 active:scale-98"
        >
          <span>{submitting ? 'Signing in…' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
          Choose account type
        </p>

        <div id="account-type" className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => selectAccount('faculty')}
            className="flex flex-col items-center p-3 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition text-center group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-indigo-900">Faculty Role</span>
            <span className="text-[10px] text-indigo-600">faculty@acadza.com</span>
          </button>

          <button
            type="button"
            onClick={() => selectAccount('student')}
            className="flex flex-col items-center p-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition text-center group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-emerald-900">Student Role</span>
            <span className="text-[10px] text-emerald-600">student@acadza.com</span>
          </button>
        </div>
      </div>

      <div className="text-center">
        <a href="#account-type" className="text-xs text-slate-500 hover:text-indigo-600 transition">
          Select the account type that matches your Firebase login
        </a>
      </div>
    </div>
  );
}

export default LoginPage;

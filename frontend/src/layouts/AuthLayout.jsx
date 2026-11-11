import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Toast } from '../components/common/Toast';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Acadza AI Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Faculty Review & Student Question Integrity Platform
          </p>
        </div>

        <Outlet />
      </div>
      <Toast />
    </div>
  );
}

export default AuthLayout;

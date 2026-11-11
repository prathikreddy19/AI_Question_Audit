import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAudit } from '../../contexts/AuditContext';

export function Navbar() {
  const { role, user, logout } = useAuth();
  const { stats } = useAudit();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isFaculty = role === 'faculty';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Unable to sign out.', error);
    } finally {
      setProfileOpen(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mode */}
        <div className="flex items-center gap-6">
          <Link
            to={isFaculty ? '/faculty' : '/student'}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-lg">
                  Acadza
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono">
                  AI AUDIT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                JEE / NEET Faculty Review Console
              </p>
            </div>
          </Link>

          {/* Role pill indicator */}
          <div
            className={`hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
              isFaculty
                ? 'bg-indigo-50/80 text-indigo-700 border-indigo-200'
                : 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
            }`}
          >
            {isFaculty ? (
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isFaculty ? 'Faculty Console' : 'Student Portal'}</span>
          </div>
        </div>

        {/* Center / Navigation Links for desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {isFaculty ? (
            <>
              <Link
                to="/faculty"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/faculty'
                    ? 'bg-slate-100 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/faculty/queue"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  location.pathname.startsWith('/faculty/queue')
                    ? 'bg-slate-100 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Review Queue</span>
                {stats.pendingReviews > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {stats.pendingReviews}
                  </span>
                )}
              </Link>
              <Link
                to="/faculty/audit"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  location.pathname.startsWith('/faculty/audit')
                    ? 'bg-slate-100 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Audit Logs
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/student"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  location.pathname === '/student'
                    ? 'bg-slate-100 text-emerald-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                JEE/NEET Question Bank
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* User profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition text-left"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-slate-800 leading-tight max-w-40 truncate">
                  {user?.email}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-fade-in">
                  <div className="p-3 border-b border-slate-100 mb-1">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      Signed in as
                    </p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">{role === 'faculty' ? 'Faculty' : 'Student'}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                      {role === 'faculty' ? 'Faculty Reviewer' : 'Student'}
                    </div>
                  </div>

                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          {isFaculty ? (
            <>
              <Link
                to="/faculty"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/faculty/queue"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <span>Review Queue</span>
                {stats.pendingReviews > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {stats.pendingReviews}
                  </span>
                )}
              </Link>
              <Link
                to="/faculty/audit"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Audit Logs
              </Link>
            </>
          ) : (
            <Link
              to="/student"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Question Bank
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

const ROLE_EMAILS = {
  'faculty@acadza.com': 'faculty',
  'student@acadza.com': 'student',
};

const DEFAULT_AVATARS = {
  faculty: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  student: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
};

export function roleForEmail(email = '') {
  return ROLE_EMAILS[email.trim().toLowerCase()] || null;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (firebaseUser) => {
    const authenticatedRole = roleForEmail(firebaseUser?.email);
    setCurrentUser(authenticatedRole ? firebaseUser : null);
    setRole(authenticatedRole);
    setLoading(false);

    // Only the two configured role accounts are allowed into this application.
    if (firebaseUser && !authenticatedRole) {
      void signOut(auth).catch((error) => {
        console.error('Unable to sign out an account without an assigned role.', error);
      });
    }
  }), []);

  const login = useCallback(async (email, password) => {
    if (!roleForEmail(email)) {
      const error = new Error('This email is not assigned to a student or faculty role.');
      error.code = 'auth/role-not-assigned';
      throw error;
    }
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    setCurrentUser(credential.user);
    setRole(roleForEmail(credential.user.email));
    return credential.user;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setCurrentUser(null);
    setRole(null);
  }, []);

  const user = useMemo(() => {
    if (!currentUser || !role) return null;
    return {
      id: currentUser.uid,
      uid: currentUser.uid,
      email: currentUser.email,
      name: currentUser.displayName || (role === 'faculty' ? 'Faculty Reviewer' : 'Student'),
      role,
      avatar: currentUser.photoURL || DEFAULT_AVATARS[role],
    };
  }, [currentUser, role]);

  const value = useMemo(() => ({
    currentUser,
    user,
    role,
    loading,
    isAuthenticated: Boolean(currentUser && role),
    login,
    logout,
  }), [currentUser, user, role, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

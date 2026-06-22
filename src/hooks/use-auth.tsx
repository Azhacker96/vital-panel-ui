import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive';
  avatar?: string;
}

interface AuthResult { success: boolean; error?: string }

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, name: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function initialsFrom(name: string, email: string): string {
  const source = (name?.trim() || email || '').trim();
  if (!source) return 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

async function loadUser(userId: string, email: string): Promise<User | null> {
  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from('profiles').select('first_name,last_name,avatar_url,status,email').eq('id', userId).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', userId).order('role', { ascending: true }).limit(1).maybeSingle(),
  ]);

  const first = profile?.first_name ?? '';
  const last = profile?.last_name ?? '';
  const name = [first, last].filter(Boolean).join(' ').trim() || (profile?.email ?? email);
  const role = (roleRow?.role as UserRole | undefined) ?? 'patient';

  return {
    id: userId,
    email: profile?.email ?? email,
    name,
    role,
    status: (profile?.status as 'active' | 'inactive') ?? 'active',
    avatar: profile?.avatar_url ?? initialsFrom(name, email),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async (s: Session | null) => {
    if (!s?.user) { setUser(null); return; }
    try {
      const u = await loadUser(s.user.id, s.user.email ?? '');
      setUser(u);
    } catch (e) {
      console.error('loadUser failed', e);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Register listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Defer DB calls out of the callback
      setTimeout(() => { hydrate(s); }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      hydrate(s).finally(() => setIsLoading(false));
    });

    return () => { sub.subscription.unsubscribe(); };
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error, data } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { success: false, error: error.message };
    if (data.session?.user) {
      const u = await loadUser(data.session.user.id, data.session.user.email ?? '');
      if (u?.status === 'inactive') {
        await supabase.auth.signOut();
        return { success: false, error: 'Your account has been deactivated. Please contact an administrator.' };
      }
    }
    return { success: true };
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<AuthResult> => {
    const parts = name.trim().split(/\s+/);
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ');
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name, first_name, last_name },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session) await hydrate(session);
  }, [session, hydrate]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!session && !!user,
      isLoading,
      login,
      signup,
      logout,
      resetPassword,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

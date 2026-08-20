import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

const PROFILE_CACHE_MS = 30_000;
const profileCache = new Map<string, { value: UserProfile; expiresAt: number }>();
const profileRequests = new Map<string, Promise<UserProfile>>();

async function fetchProfile(user: User): Promise<UserProfile> {
  const userId = user.id;
  const cached = profileCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const existing = profileRequests.get(userId);
  if (existing) return existing;

  const request = (async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role_code, created_at, updated_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Could not query profiles table, falling back to metadata:', error.message);
      }

      if (data) {
        const val: UserProfile = {
          id: data.id,
          name: data.name || user.user_metadata?.name || user.email?.split('@')[0] || '維修工程師',
          role_code: typeof data.role_code === 'number' ? data.role_code : 1,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        profileCache.set(userId, { value: val, expiresAt: Date.now() + PROFILE_CACHE_MS });
        return val;
      }

      // If no profile record found yet, fallback to user_metadata
      const fallback: UserProfile = {
        id: userId,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '維修工程師',
        role_code: typeof user.user_metadata?.role_code === 'number' ? user.user_metadata.role_code : 1,
      };

      // Proactively create profile if it doesn't exist
      try {
        await supabase.from('profiles').upsert({
          id: userId,
          name: fallback.name,
          role_code: fallback.role_code,
        });
      } catch (upsertErr) {
        console.warn('Upsert fallback profile failed:', upsertErr);
      }

      profileCache.set(userId, { value: fallback, expiresAt: Date.now() + PROFILE_CACHE_MS });
      return fallback;
    } catch (err) {
      console.error('Fetch profile unexpected error:', err);
      const fallback: UserProfile = {
        id: userId,
        name: user.user_metadata?.name || user.email?.split('@')[0] || '維修工程師',
        role_code: 1,
      };
      return fallback;
    }
  })().finally(() => {
    profileRequests.delete(userId);
  });

  profileRequests.set(userId, request);
  return request;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionVersionRef = useRef(0);
  const initializedRef = useRef(false);

  const applySession = useCallback(async (session: Session | null) => {
    const version = ++sessionVersionRef.current;
    const nextUser = session?.user ?? null;
    setUser(nextUser);

    if (!nextUser) {
      setProfile(null);
      initializedRef.current = true;
      setIsLoading(false);
      return;
    }

    if (!initializedRef.current) {
      setIsLoading(true);
    }

    try {
      const nextProfile = await fetchProfile(nextUser);
      if (sessionVersionRef.current !== version) return;
      setProfile(nextProfile);
    } catch (error) {
      if (sessionVersionRef.current !== version) return;
      console.error('Error in applySession:', error);
    } finally {
      if (sessionVersionRef.current === version) {
        initializedRef.current = true;
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (active) void applySession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) void applySession(session);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signOut = useCallback(async () => {
    profileCache.clear();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    profileCache.delete(user.id);
    const updated = await fetchProfile(user);
    setProfile(updated);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: Role;
  loading: boolean;
  ready: boolean; // env/config present
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  role: "guest",
  loading: true,
  ready: false,
  refresh: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const initRef = useRef(false);

  const loadProfile = useCallback(async (uid: string, attempt = 0): Promise<Profile | null> => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return null;
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
      if (data) return data as Profile;
      // The handle_new_user trigger may lag a moment on a brand-new signup.
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 500));
        return loadProfile(uid, attempt + 1);
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    }
    return null;
  }, []);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser ?? null);
      if (currentUser) {
        const prof = await loadProfile(currentUser.id);
        setProfile(prof);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to refresh auth:", e);
      setUser(null);
      setProfile(null);
    }
  }, [loadProfile]);

  useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) {
      setLoading(false);
      setReady(false);
      return;
    }
    setReady(true);

    // Only initialize once
    if (initRef.current) return;
    initRef.current = true;

    // Get initial auth state immediately
    (async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        setUser(currentUser ?? null);
        if (currentUser) {
          const prof = await loadProfile(currentUser.id);
          setProfile(prof);
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error("Failed to get initial user:", e);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const prof = await loadProfile(session.user.id);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const role: Role = profile?.role ?? (user ? "user" : "guest");

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, ready, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

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
      const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
      if (data) return data as Profile;
      // Profile might not exist immediately after signup due to trigger delay
      if (attempt < 2 && error?.code === "PGRST116") {
        await new Promise((r) => setTimeout(r, 500));
        return loadProfile(uid, attempt + 1);
      }
      if (error) {
        console.error("Profile load error:", error.message);
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
      // First ensure session is restored from storage
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const prof = await loadProfile(session.user.id);
        setProfile(prof);
      } else {
        setUser(null);
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

    // Restore session and profile on initial load
    (async () => {
      try {
        // First, ensure session is restored from storage
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          const prof = await loadProfile(session.user.id);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        console.error("Failed to restore initial session:", e);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();

    // Listen for auth changes after initial restore
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle different auth events
      if (event === "INITIAL_SESSION") {
        // Initial session loaded from storage - already handled above
        return;
      }

      if (event === "SIGNED_IN") {
        // User just signed in
        setUser(session?.user ?? null);
        if (session?.user) {
          const prof = await loadProfile(session.user.id);
          setProfile(prof);
        }
        setLoading(false);
      } else if (event === "SIGNED_OUT") {
        // User signed out
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === "TOKEN_REFRESHED") {
        // Token automatically refreshed - no action needed, session is updated
        setLoading(false);
      } else if (event === "USER_UPDATED") {
        // User info updated (e.g., email confirmed)
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      sub?.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const role: Role = profile?.role ?? (user ? "user" : "guest");

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, ready, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

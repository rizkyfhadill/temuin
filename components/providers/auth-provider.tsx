"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  const loadProfile = useCallback(async (uid: string, attempt = 0): Promise<Profile | null> => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) return data as Profile;
    // The handle_new_user trigger may lag a moment on a brand-new signup.
    if (attempt < 1) {
      await new Promise((r) => setTimeout(r, 500));
      return loadProfile(uid, attempt + 1);
    }
    return null;
  }, []);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) setProfile(await loadProfile(user.id));
  }, [loadProfile]);

  useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) {
      setLoading(false);
      setReady(false);
      return;
    }
    setReady(true);

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      if (data.user) setProfile(await loadProfile(data.user.id));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setProfile(await loadProfile(session.user.id));
      else setProfile(null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const role: Role = profile?.role ?? (user ? "user" : "guest");

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, ready, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

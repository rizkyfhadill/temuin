"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import type { Profile, Role } from "@/lib/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: Role;
  loading: boolean;
  ready: boolean;
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
  const authRequestIdRef = useRef(0);

  const buildFallbackProfile = useCallback((activeUser: User): Profile => ({
    id: activeUser.id,
    username:
      (activeUser.user_metadata?.username as string | undefined) ||
      (activeUser.email?.split("@")[0] ?? "pengguna").replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase(),
    full_name: (activeUser.user_metadata?.full_name as string | undefined) ?? null,
    avatar_url: (activeUser.user_metadata?.avatar_url as string | undefined) ?? null,
    role: ((activeUser.user_metadata?.role as Role | undefined) ?? "user"),
    city: (activeUser.user_metadata?.city as string | undefined) ?? null,
    bio: null,
    verified: Boolean(activeUser.user_metadata?.verified),
    suspended: Boolean(activeUser.user_metadata?.suspended),
    points: 0,
    created_at: activeUser.created_at ?? new Date().toISOString(),
    updated_at: activeUser.updated_at ?? new Date().toISOString(),
  }), []);

  const loadProfile = useCallback(async (uid: string, attempt = 0): Promise<Profile | null> => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).single();
      if (data) return data as Profile;
      if (attempt < 2 && error?.code === "PGRST116") {
        await new Promise((r) => setTimeout(r, 500));
        return loadProfile(uid, attempt + 1);
      }
      if (error) {
        console.warn("Profile load warning:", error.message);
      }
    } catch (e) {
      console.warn("Failed to load profile, using fallback:", e);
    }
    return null;
  }, []);

  const resolveProfile = useCallback(
    async (activeUser: User) => {
      const prof = await loadProfile(activeUser.id);
      return prof ?? buildFallbackProfile(activeUser);
    },
    [buildFallbackProfile, loadProfile]
  );

  const syncAuthState = useCallback(
    async (eventSession: Session | null = null) => {
      const requestId = ++authRequestIdRef.current;
      const supabase = getSupabaseBrowserSafe();

      if (!supabase) {
        if (requestId === authRequestIdRef.current) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          setReady(false);
        }
        return;
      }

      setReady(true);
      setLoading(true);

      try {
        const session = eventSession ?? (await supabase.auth.getSession()).data.session ?? null;
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError && userError.message) {
          console.warn("Auth user check failed:", userError.message);
        }

        if (requestId !== authRequestIdRef.current) return;

        const activeUser = userData?.user ?? session?.user ?? null;
        if (activeUser) {
          setUser(activeUser);
          const prof = await resolveProfile(activeUser);
          if (requestId !== authRequestIdRef.current) return;
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        if (requestId !== authRequestIdRef.current) return;
        console.error("Failed to restore auth state:", error);
        setUser(null);
        setProfile(null);
      } finally {
        if (requestId === authRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [resolveProfile]
  );

  const refresh = useCallback(async () => {
    await syncAuthState();
  }, [syncAuthState]);

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

    void syncAuthState();

    // Listen for auth changes after initial restore
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        authRequestIdRef.current += 1;
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        void syncAuthState(session ?? null);
      }
    });

    return () => {
      data?.subscription.unsubscribe();
    };
  }, [loadProfile, syncAuthState]);

  const role: Role = profile?.role ?? (user ? "user" : "guest");

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, ready, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { LoginMessage } from "@/components/auth/login-message";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [noEnv, setNoEnv] = React.useState(false);

  React.useEffect(() => {
    if (!getSupabaseBrowserSafe()) setNoEnv(true);
  }, []);

  const nextPath = searchParams.get("next") || "/dashboard";

  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace(nextPath);
      }
    })();
  }, [nextPath, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return setNoEnv(true);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Format email tidak valid");
    if (!password) return toast.error("Password wajib diisi");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      toast.error("Login gagal. Silakan coba lagi.");
      return;
    }

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

    await refresh();
    toast.success("Masuk berhasil");

    if (userProfile?.role === "admin") {
      router.push("/admin");
    } else {
      router.push(nextPath === "/login" || nextPath === "/register" ? "/dashboard" : nextPath);
    }
    router.refresh();
  };

  const google = async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return setNoEnv(true);
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setGoogleLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <LoginMessage />
      </Suspense>
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
        <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-xl font-bold">
            <Image src="/temuin-logo.png" alt="Temuin" width={40} height={40} className="size-10" />
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Masuk</h1>
          <p className="text-sm text-muted-foreground">Selamat datang kembali di Temuin.</p>
        </div>

        {noEnv && (
          <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
            Supabase belum dikonfigurasi. Salin <code>.env.local.example</code> → <code>.env.local</code> dan isi
            URL &amp; anon key Supabase Anda.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-soft">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@email.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot" className="text-xs text-primary hover:underline">Lupa?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••••" />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />} Masuk
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> atau <span className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" onClick={google} disabled={googleLoading}>
          {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />} Masuk dengan Google
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">Daftar</Link>
        </p>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
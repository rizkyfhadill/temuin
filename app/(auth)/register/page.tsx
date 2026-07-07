"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = React.useState({ username: "", full_name: "", email: "", password: "", confirm: "", city: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);
  const [noEnv, setNoEnv] = React.useState(false);

  React.useEffect(() => {
    if (!getSupabaseBrowserSafe()) setNoEnv(true);
  }, []);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace("/dashboard");
      }
    })();
  }, [router]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) e.username = "3–20 karakter (huruf, angka, _).";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = "Format email tidak valid.";
    if (form.password.length < 6) e.password = "Minimal 6 karakter.";
    if (form.confirm !== form.password) e.confirm = "Konfirmasi password tidak cocok.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return setNoEnv(true);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/login`,
        data: {
          username: form.username,
          full_name: form.full_name,
          city: form.city,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);

    // Always persist the profile immediately for better UX
    if (data.user) {
      try {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            username: form.username,
            full_name: form.full_name,
            city: form.city,
          },
          { onConflict: "id" }
        );
        if (profileError) {
          console.error("Profile creation error:", profileError);
        }
      } catch (err) {
        console.error("Profile creation exception:", err);
      }
    }

    // Always redirect to login - never auto-login after signup
    toast.success("Registrasi berhasil, silakan login");
    router.push("/login");
  };

  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] items-center justify-center py-6 sm:py-10 px-2 sm:px-0">
      <div className="w-full max-w-sm">
        <div className="mb-4 sm:mb-6 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 text-xl font-bold">
            <Image src="/temuin-logo.png" alt="Temuin" width={40} height={40} className="size-8 sm:size-10" />
          </Link>
          <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-bold">Daftar</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Buat akun untuk mulai melaporkan barang.</p>
        </div>

        {noEnv && (
          <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 p-2 sm:p-3 text-xs text-warning">
            Supabase belum dikonfigurasi. Salin <code>.env.local.example</code> → <code>.env.local</code> dan isi
            URL &amp; anon key Supabase Anda.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3 sm:space-y-4 rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-6 shadow-soft">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="username" value={form.username} onChange={set("username")} className="pl-9 text-sm" placeholder="username" />
            </div>
            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="full_name" className="text-sm">Nama Lengkap</Label>
            <Input id="full_name" value={form.full_name} onChange={set("full_name")} className="text-sm" placeholder="Budi Santoso" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" value={form.email} onChange={set("email")} className="pl-9 text-sm" placeholder="you@email.com" />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm">Kota</Label>
            <Input id="city" value={form.city} onChange={set("city")} className="text-sm" placeholder="Jakarta" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" value={form.password} onChange={set("password")} className="pl-9 text-sm" placeholder="Minimal 6 karakter" />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-sm">Konfirmasi Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} className="pl-9 text-sm" placeholder="Ulangi password" />
            </div>
            {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
          </div>
          <Button type="submit" className="w-full text-sm" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />} Daftar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
}

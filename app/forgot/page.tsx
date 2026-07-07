"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Format email tidak valid");
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return toast.error("Supabase belum dikonfigurasi");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/login&type=recovery`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Link reset password telah dikirim ke email Anda");
  };

  return (
    <div className="container flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] items-center justify-center py-6 sm:py-10 px-2 sm:px-0">
      <div className="w-full max-w-sm">
        <h1 className="text-xl sm:text-2xl font-bold">Lupa Password</h1>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">Masukkan email untuk menerima link reset.</p>
        <form onSubmit={submit} className="mt-4 sm:mt-6 space-y-4 rounded-lg sm:rounded-xl border border-border bg-card p-4 sm:p-6 shadow-soft">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 text-sm" />
            </div>
          </div>
          <Button type="submit" className="w-full text-sm" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />} Kirim Link Reset
          </Button>
        </form>
        <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">Kembali ke Masuk</Link>
        </p>
      </div>
    </div>
  );
}

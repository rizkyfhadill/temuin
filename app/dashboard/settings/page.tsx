"use client";

import * as React from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor, LogOut, Loader2, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { refresh } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const logout = async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    setLeaving(true);
    await supabase.auth.signOut();
    await refresh();
    router.push("/");
  };

  const [pw, setPw] = React.useState({ new: "", confirm: "" });
  const [pwBusy, setPwBusy] = React.useState(false);
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.new.length < 6) return toast.error("Password baru minimal 6 karakter.");
    if (pw.new !== pw.confirm) return toast.error("Konfirmasi tidak cocok.");
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    setPwBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw.new });
    setPwBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password berhasil diubah");
    setPw({ new: "", confirm: "" });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>

      <Card className="space-y-3 p-6">
        <h2 className="font-semibold">Tema</h2>
        <p className="text-sm text-muted-foreground">Pilih tampilan yang nyaman di mata kamu.</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors",
                mounted && theme === t.value ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-accent"
              )}
            >
              <t.icon className="size-6" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-semibold"><KeyRound className="size-4 text-primary" /> Ubah Password</h2>
        <form onSubmit={changePassword} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Password Baru</Label>
            <Input type="password" value={pw.new} onChange={(e) => setPw({ ...pw, new: e.target.value })} placeholder="Minimal 6 karakter" />
          </div>
          <div className="space-y-1.5">
            <Label>Konfirmasi</Label>
            <Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="Ulangi password" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pwBusy}>
              {pwBusy && <Loader2 className="size-4 animate-spin" />} Simpan Password
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-3 p-6">
        <h2 className="font-semibold">Akun</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Keluar dari perangkat</p>
            <p className="text-xs text-muted-foreground">Akhiri sesi login saat ini.</p>
          </div>
          <Button variant="destructive" onClick={logout} disabled={leaving}>
            {leaving ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />} Keluar
          </Button>
        </div>
      </Card>
    </div>
  );
}

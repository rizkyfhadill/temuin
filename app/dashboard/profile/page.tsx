"use client";

import * as React from "react";
import { Save, Loader2, BadgeCheck, Camera, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import { BadgeShelf } from "@/components/badges/badge-shelf";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import type { Badge as BadgeType } from "@/lib/types";

export default function ProfilePage() {
  const { profile, refresh } = useAuth();
  const [form, setForm] = React.useState({ full_name: "", city: "", bio: "" });
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [badges, setBadges] = React.useState<BadgeType[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? "", city: profile.city ?? "", bio: profile.bio ?? "" });
  }, [profile]);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !profile) return;
    (async () => {
      const { data } = await supabase.from("user_badges").select("badges(*)").eq("user_id", profile.id);
      setBadges(((data ?? []) as any[]).map((r) => r.badges).filter(Boolean));
    })();
  }, [profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update(form).eq("id", profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success("Profil diperbarui");
  };

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("File harus berupa gambar.");
    if (file.size > 2 * 1024 * 1024) return toast.error("Ukuran foto maksimal 2 MB.");
    setPreview(URL.createObjectURL(file));
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !profile) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      setUploading(false);
      return toast.error(upErr.message);
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
    setUploading(false);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success("Foto profil diperbarui");
  };

  const removeAvatar = async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !profile) return;
    setUploading(true);
    const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", profile.id);
    setUploading(false);
    if (error) return toast.error(error.message);
    setPreview(null);
    await refresh();
    toast.success("Foto profil dihapus");
  };

  if (!profile) return <p className="text-sm text-muted-foreground">Memuat…</p>;

  const avatarSrc = preview ?? profile.avatar_url;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} className="group relative shrink-0 rounded-full" title="Ubah foto">
            <Avatar src={avatarSrc} name={profile.username} size={64} />
            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-5" />
            </span>
          </button>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-lg font-semibold">@{profile.username}</p>
            {profile.verified && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <BadgeCheck className="size-3.5" /> Terverifikasi
              </span>
            )}
            <div className="mt-1 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
                <span>Ubah Foto</span>
              </Button>
              {profile.avatar_url && (
                <Button type="button" size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={removeAvatar} disabled={uploading}>
                  <Trash2 className="size-3.5" />
                  <span>Hapus</span>
                </Button>
              )}
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        </div>

        <form onSubmit={save} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Lengkap</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Kota</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            <Save className="size-4" />
            <span>Simpan</span>
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Poin Reputasi</p>
            <p className="text-2xl font-bold text-primary">{profile.points ?? 0}</p>
          </div>
          <BadgeShelf badges={badges} empty="Belum ada badge. Ayo buat laporan pertamamu!" />
        </div>
      </Card>
    </div>
  );
}

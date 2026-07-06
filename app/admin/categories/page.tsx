"use client";

import * as React from "react";
import * as Icons from "lucide-react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

const ICON_NAMES = ["Wallet","Key","Smartphone","FileText","Bike","PawPrint","Briefcase","Gem","Shirt","Package"];

export default function AdminCategoriesPage() {
  const [cats, setCats] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("Package");
  const [color, setColor] = React.useState("#DC2626");
  const [editing, setEditing] = React.useState<Category | null>(null);

  const load = React.useCallback(async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return setLoading(false);
    const { data } = await supabase.from("categories").select("*").order("name");
    setCats((data as Category[]) ?? []);
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const save = async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !name.trim()) return toast.error("Nama wajib diisi");
    if (editing) {
      const { error } = await supabase.from("categories").update({ name, icon, color }).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Kategori diperbarui");
    } else {
      const { error } = await supabase.from("categories").insert({ name, slug: slugify(name), icon, color });
      if (error) return toast.error(error.message);
      toast.success("Kategori ditambahkan");
    }
    setName(""); setIcon("Package"); setColor("#DC2626"); setEditing(null); load();
  };

  const del = async (id: string) => {
    if (!confirm("Hapus kategori?")) return;
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Kategori dihapus"); load();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Memuat…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
        <p className="text-muted-foreground">Kelola kategori barang.</p>
      </div>

      <Card className="space-y-3 p-5">
        <h2 className="font-semibold">{editing ? "Edit Kategori" : "Tambah Kategori"}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Nama</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis. Dompet" />
          </div>
          <div className="space-y-1.5">
            <Label>Ikon</Label>
            <select value={icon} onChange={(e) => setIcon(e.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none">
              {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Warna</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 rounded-lg border border-input bg-background" />
              <Input value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={save}><Save className="size-4" /> {editing ? "Simpan" : "Tambah"}</Button>
          {editing && <Button variant="ghost" onClick={() => { setEditing(null); setName(""); }}>Batal</Button>}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => {
          const Icon = (Icons as any)[c.icon || "Package"] || Icons.Package;
          return (
            <Card key={c.id} className="flex items-center gap-3 p-4">
              <span className="grid size-10 place-items-center rounded-lg text-white" style={{ backgroundColor: c.color || "#DC2626" }}>
                <Icon className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">/{c.slug}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setName(c.name); setIcon(c.icon || "Package"); setColor(c.color || "#DC2626"); }}><Pencil className="size-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => del(c.id)}><Trash2 className="size-4" /></Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

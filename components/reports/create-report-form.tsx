"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PackageX, PackageCheck, Sparkles, Upload, Loader2, Check, ArrowRight, ArrowLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { ReportType, Category } from "@/lib/types";
import type { AiAnalysis } from "@/lib/ai";

const STEPS = ["Pilih Tipe", "Unggah Foto (AI)", "Isi Detail", "Pratinjau"];

export function CreateReportForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [step, setStep] = React.useState(0);
  const [type, setType] = React.useState<ReportType | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<AiAnalysis | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    category_id: "",
    color: "",
    location: "",
    city: "",
    lost_found_date: new Date().toISOString().slice(0, 10),
  });

  const guest = !loading && role === "guest";

  if (guest) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <Sparkles className="mx-auto size-10 text-primary" />
        <h2 className="mt-4 text-xl font-bold">Login untuk membuat laporan</h2>
        <p className="mt-2 text-sm text-muted-foreground">Kamu harus masuk untuk melaporkan barang hilang atau ditemukan.</p>
        <Button asChild className="mt-5">
          <Link href="/login?next=/reports/new">Masuk / Daftar</Link>
        </Button>
      </Card>
    );
  }

  const pickFile = async (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (jpg/png/webp).");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5 MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAnalyzing(true);

    // Read the image as base64 so Gemini Vision can actually analyze it.
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(f);
    });
    const base64 = dataUrl.split(",")[1] ?? "";

    const res = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: f.name, mimeType: f.type, base64 }),
    });
    const data: AiAnalysis = await res.json();
    setAnalysis(data);
    // Auto-fill from AI.
    const matched = categories.find((c) => c.slug === data.categorySlug || c.name === data.category);
    setForm((fm) => ({
      ...fm,
      title: fm.title || f.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").slice(0, 60),
      description: data.description,
      color: data.color,
      category_id: matched?.id ?? fm.category_id,
    }));
    setAnalyzing(false);
    toast.success(`AI mendeteksi: ${data.category} • ${data.color} (${Math.round(data.confidence * 100)}%)`);
  };

  const submit = async () => {
    const supabase = getSupabaseBrowserSafe();
    if (!supabase || !user) return toast.error("Supabase belum terhubung");
    if (!type) return toast.error("Pilih tipe laporan.");
    if (form.title.trim().length < 3) return toast.error("Nama barang minimal 3 karakter.");
    if (form.description.trim().length < 10) return toast.error("Deskripsi minimal 10 karakter.");
    if (!form.category_id) return toast.error("Pilih kategori.");
    setSubmitting(true);

    let finalImage = imageUrl;
    if (file) {
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("report-images")
        .upload(path, file, { upsert: false });
      if (!upErr) {
        const { data } = supabase.storage.from("report-images").getPublicUrl(path);
        finalImage = data.publicUrl;
      }
    }

    const { error } = await supabase.from("reports").insert({
      type,
      title: form.title,
      description: form.description,
      category_id: form.category_id || null,
      color: form.color || null,
      image_url: finalImage,
      location: form.location || null,
      city: form.city || null,
      lost_found_date: form.lost_found_date,
      status: "pending", // Menunggu Verifikasi
      owner_id: user.id,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Laporan dikirim — Menunggu Verifikasi admin");
    router.push("/dashboard/my-reports");
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Stepper */}
      <ol className="mb-8 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full text-sm font-semibold",
                  i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={cn("hidden text-sm font-medium sm:inline", i <= step ? "text-foreground" : "text-muted-foreground")}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && <span className={cn("mx-3 h-px flex-1", i < step ? "bg-primary" : "bg-border")} />}
          </li>
        ))}
      </ol>

      <Card className="p-6">
        {/* Step 0: type */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Apa yang ingin kamu laporkan?</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {([
                { v: "lost", icon: PackageX, title: "Barang Hilang", desc: "Saya kehilangan barang." },
                { v: "found", icon: PackageCheck, title: "Barang Ditemukan", desc: "Saya menemukan barang." },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  onClick={() => setType(o.v)}
                  className={cn(
                    "rounded-xl border p-5 text-left transition-colors",
                    type === o.v ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                  )}
                >
                  <o.icon className={cn("size-8", type === o.v ? "text-primary" : "text-muted-foreground")} />
                  <p className="mt-3 font-semibold">{o.title}</p>
                  <p className="text-sm text-muted-foreground">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: upload + AI */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Unggah Foto — AI akan menganalisis</h2>
            <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 text-muted-foreground hover:bg-accent">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <>
                  <Camera className="size-8" />
                  <span className="text-sm">Klik untuk unggah foto</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
              />
            </label>
            {analyzing && (
              <p className="flex items-center gap-2 text-sm text-primary">
                <Loader2 className="size-4 animate-spin" /> AI sedang menganalisis gambar…
              </p>
            )}
            {analysis && !analyzing && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                <p className="flex items-center gap-2 font-medium text-primary">
                  <Sparkles className="size-4" /> Hasil Analisis AI
                </p>
                <p className="mt-1 text-muted-foreground">
                  Kategori: <b>{analysis.category}</b> • Warna: <b>{analysis.color}</b> • Keyakinan:{" "}
                  <b>{Math.round(analysis.confidence * 100)}%</b>
                </p>
                <p className="mt-1 text-muted-foreground">Deskripsi otomatis telah diisi — kamu bisa mengubahnya.</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Foto opsional, tapi sangat membantu pencocokan AI.</p>
          </div>
        )}

        {/* Step 2: details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Isi Detail Laporan</h2>
            <div className="space-y-1.5">
              <Label htmlFor="title">Nama Barang</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mis. Dompet kulit hitam" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="color">Warna</Label>
                <Input id="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Mis. Hitam" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Lokasi</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Mis. Stasiun Kota" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Kota</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mis. Jakarta" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Tanggal {type === "lost" ? "Hilang" : "Ditemukan"}</Label>
              <Input id="date" type="date" value={form.lost_found_date} onChange={(e) => setForm({ ...form, lost_found_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Deskripsi</Label>
              <Textarea id="desc" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
        )}

        {/* Step 3: preview */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pratinjau Laporan</h2>
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="aspect-[16/9] bg-muted">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground">Tanpa foto</div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <Badge variant={type === "lost" ? "destructive" : "success"}>
                  {type === "lost" ? "Barang Hilang" : "Barang Ditemukan"}
                </Badge>
                <h3 className="text-lg font-bold">{form.title || "—"}</h3>
                <p className="text-sm text-muted-foreground">{form.description}</p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
                  {form.category_id && <span>Kategori: {categories.find((c) => c.id === form.category_id)?.name}</span>}
                  {form.color && <span>• Warna: {form.color}</span>}
                  {form.location && <span>• {form.location}</span>}
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              Setelah dikirim, laporan berstatus <b>Menunggu Verifikasi</b>. Admin akan meninjau sebelum dipublikasikan.
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft className="size-4" /> Sebelumnya
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !type}>
              Lanjut <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting || !form.title || !form.category_id}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Kirim Laporan
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

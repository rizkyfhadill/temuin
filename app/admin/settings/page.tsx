"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/providers/theme-provider";
import { toast } from "@/components/ui/toaster";

export default function AdminSettingsPage() {
  const { setTheme } = useTheme();
  const [siteName, setSiteName] = React.useState("Temuin");
  const [tagline, setTagline] = React.useState("Barang hilang? Temuin aja.");
  const [autoApprove, setAutoApprove] = React.useState(false);
  const [aiMatch, setAiMatch] = React.useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Website</h1>
        <p className="text-muted-foreground">Konfigurasi global platform.</p>
      </div>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Identitas</h2>
        <div className="space-y-1.5"><Label>Nama Situs</Label><Input value={siteName} onChange={(e) => setSiteName(e.target.value)} /></div>
        <div className="space-y-1.5"><Label>Tagline</Label><Input value={tagline} onChange={(e) => setTagline(e.target.value)} /></div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Moderasi & AI</h2>
        <Toggle label="Auto-approve laporan (tanpa review admin)" checked={autoApprove} onChange={setAutoApprove} />
        <Toggle label="Aktifkan AI Smart Match" checked={aiMatch} onChange={setAiMatch} />
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Tampilan Default</h2>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <Button
              key={t}
              variant="outline"
              size="sm"
              onClick={() => {
                setTheme(t);
                toast.success(`Tema default: ${t}`);
              }}
            >
              {t}
            </Button>
          ))}
        </div>
      </Card>

      <Button onClick={() => toast.success("Pengaturan disimpan (demo)")}><Save className="size-4" /> Simpan Pengaturan</Button>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

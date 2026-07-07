// ============================================================
// Temuin - AI Engine (Gemini, with deterministic fallback)
//
// - analyzeImage: Gemini Vision (multimodal) → kategori, warna, deskripsi.
// - aiChatAssistant: Gemini text → jawaban safety/match.
// - scoreMatch: deterministic scoring (kecocokan laporan) — bukan generatif.
//
// Requires GEMINI_API_KEY. Without it, the deterministic mock is used so
// the whole flow still works (no API key needed to demo).
// ============================================================

import type { Report } from "./types";

export interface AiAnalysis {
  category: string;
  categorySlug: string;
  color: string;
  description: string;
  confidence: number; // 0..1
  tags: string[];
}

// Fixed category vocabulary (mirrors supabase/seed categories).
const CATEGORIES: { slug: string; name: string }[] = [
  { slug: "dompet", name: "Dompet" },
  { slug: "kunci", name: "Kunci" },
  { slug: "elektronik", name: "Elektronik" },
  { slug: "dokumen", name: "Dokumen" },
  { slug: "kendaraan", name: "Kendaraan" },
  { slug: "hewan", name: "Hewan Peliharaan" },
  { slug: "tas", name: "Tas" },
  { slug: "perhiasan", name: "Perhiasan" },
  { slug: "pakaian", name: "Pakaian" },
  { slug: "lainnya", name: "Lainnya" },
];

function mapCategory(name?: string) {
  const n = (name || "").trim().toLowerCase();
  const hit = CATEGORIES.find((c) => c.name.toLowerCase() === n);
  return hit ?? CATEGORIES[CATEGORIES.length - 1];
}

function clamp(n: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, n));
}

function geminiKey() {
  return process.env.GEMINI_API_KEY;
}
function geminiModel() {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

async function geminiGenerate(parts: any[], config: any): Promise<string | null> {
  const key = geminiKey();
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }], generationConfig: config }),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

// ---------------- Analyze image (Vision) ----------------
export async function analyzeImage(opts: {
  fileName?: string;
  mimeType?: string;
  base64?: string;
  hint?: string;
}): Promise<AiAnalysis> {
  const text = await geminiGenerate(
    [
      opts.base64
        ? { inline_data: { mime_type: opts.mimeType || "image/jpeg", data: opts.base64 } }
        : null,
      {
        text:
          "Ini foto barang hilang atau ditemukan. Balas HANYA dengan JSON: " +
          `{ "category": salah satu dari [${CATEGORIES.map((c) => `"${c.name}"`).join(", ")}], ` +
          `"color": "warna dominan (Bahasa Indonesia, mis. Hitam)", ` +
          `"description": "deskripsi singkat 1-2 kalimat Bahasa Indonesia yang membantu pencocokan", ` +
          `"confidence": angka 0-1 kepercayaan analisismu }.` +
          (opts.fileName ? ` Nama file: ${opts.fileName}.` : ""),
      },
    ].filter(Boolean) as any[],
    { responseMimeType: "application/json", temperature: 0.3 }
  );

  if (text) {
    try {
      const p = JSON.parse(text);
      const cat = mapCategory(p.category);
      return {
        category: cat.name,
        categorySlug: cat.slug,
        color: typeof p.color === "string" && p.color ? p.color : "—",
        description: typeof p.description === "string" ? p.description : "",
        confidence: clamp(Number(p.confidence) || 0.85),
        tags: [typeof p.color === "string" ? p.color : "", cat.name].filter(Boolean),
      };
    } catch {
      /* fall through to mock */
    }
  }
  return mockAnalyzeImage(opts);
}

// ---------------- AI Chat Assistant ----------------
export async function aiChatAssistant(
  question: string,
  ctx?: { sourceTitle?: string; candidateTitle?: string }
): Promise<string> {
  const prompt =
    "Kamu adalah asisten keamanan untuk platform lost & found Indonesia bernama Temuin. " +
    "Jawab singkat, ramah, dan membantu dalam Bahasa Indonesia. " +
    "Fokus pada: kecocokan laporan, serta keamanan serah terima (tempat umum, jangan bagikan alamat pribadi). " +
    (ctx?.sourceTitle ? `Laporan A: "${ctx.sourceTitle}". ` : "") +
    (ctx?.candidateTitle ? `Laporan B (kandidat cocok): "${ctx.candidateTitle}". ` : "") +
    `Pertanyaan pengguna: ${question}`;

  const text = await geminiGenerate([{ text: prompt }], { temperature: 0.4, maxOutputTokens: 300 });
  return text?.trim() || mockAiChatAssistant(question, ctx);
}

// ---------------- Deterministic fallback (no key) ----------------
function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

export function mockAnalyzeImage(opts: { fileName?: string; mimeType?: string; hint?: string }): AiAnalysis {
  const text = `${opts.fileName ?? ""} ${opts.hint ?? ""}`.toLowerCase();
  const seed = hashString(text || "temuin");
  const KW: { slug: string; name: string; kw: string[] }[] = [
    { slug: "dompet", name: "Dompet", kw: ["dompet", "wallet", "uang", "kartu", "atm", "ktp"] },
    { slug: "kunci", name: "Kunci", kw: ["kunci", "key", "remote"] },
    { slug: "elektronik", name: "Elektronik", kw: ["hp", "handphone", "ponsel", "phone", "laptop", "tablet", "charger", "earphone", "headset", "kamera", "watch", "jam tangan"] },
    { slug: "dokumen", name: "Dokumen", kw: ["dokumen", "ijasah", "ijazah", "surat", "sim", "paspor", "buku"] },
    { slug: "kendaraan", name: "Kendaraan", kw: ["sepeda", "bike", "motor", "mobil", "helm", "skuter"] },
    { slug: "hewan", name: "Hewan Peliharaan", kw: ["kucing", "cat", "anjing", "dog", "burung", "kelinci", "hamster"] },
    { slug: "tas", name: "Tas", kw: ["tas", "backpack", "ransel", "koper", "luggage"] },
    { slug: "perhiasan", name: "Perhiasan", kw: ["cincin", "ring", "kalung", "necklace", "anting", "gelang", "emas", "perak", "jam"] },
    { slug: "pakaian", name: "Pakaian", kw: ["baju", "jaket", "jacket", "sepatu", "shoes", "kemeja", "celana", "topi"] },
    { slug: "lainnya", name: "Lainnya", kw: [] },
  ];
  const match = KW.find((k) => k.kw.some((w) => text.includes(w))) ?? KW[KW.length - 1];
  const confidence = 0.72 + (seed % 25) / 100;
  const colors = ["Hitam", "Putih", "Merah", "Biru", "Hijau", "Kuning", "Cokelat", "Abu-abu", "Silver", "Emas", "Pink", "Ungu"];
  const color = colors[seed % colors.length];
  return {
    category: match.name,
    categorySlug: match.slug,
    color,
    description:
      `Berdasarkan analisis gambar, objek terdeteksi sebagai ${match.name.toLowerCase()} berwarna ${color.toLowerCase()}. ` +
      `Pastikan untuk melengkapi ciri-ciri khusus agar memudahkan pencocokan otomatis.`,
    confidence,
    tags: [color.toLowerCase(), match.name.toLowerCase()],
  };
}

export function mockAiChatAssistant(question: string, ctx?: { sourceTitle?: string; candidateTitle?: string }): string {
  const q = question.toLowerCase();
  if (q.includes("cocok") || q.includes("match") || q.includes("sama")) {
    return (
      `Berdasarkan data, laporan "${ctx?.sourceTitle ?? "ini"}" dan "${ctx?.candidateTitle ?? "laporan terkait"}" ` +
      `memiliki kecocokan pada kategori & warna. Minta penemu menjelaskan ciri khusus sebelum serah terima.`
    );
  }
  if (q.includes("aman") || q.includes("safe") || q.includes("temu")) {
    return "Sebaiknya lakukan serah terima di tempat umum yang aman (stasiun, mall, kantor polisi) dan jangan bagikan alamat rumah.";
  }
  if (q.includes("alamat") || q.includes("wa") || q.includes("whatsapp") || q.includes("telepon")) {
    return "Untuk keamanan, jangan membagikan nomor WA/alamat di sini. Gunakan chat internal Temuin hingga saling percaya.";
  }
  return "AI Temuin siap membantu. Tips: minta foto asli & ciri khusus, sepakati waktu & tempat umum, lalu tandai 'Barang Sudah Kembali'.";
}

// ---------------- Smart Match scoring (deterministic) ----------------
export function scoreMatch(source: Report, candidate: Report): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];
  if (source.type !== candidate.type) {
    score += 0.25;
    reasons.push("Tipe berlawanan (hilang ↔ temuan) memungkinkan kecocokan");
  } else {
    score -= 0.1;
  }
  if (source.category_id && source.category_id === candidate.category_id) {
    score += 0.3;
    reasons.push("Kategori sama");
  }
  if (source.category_name && candidate.category_name && source.category_name === candidate.category_name) {
    score += 0.05;
  }
  if (source.color && candidate.color && source.color === candidate.color) {
    score += 0.2;
    reasons.push(`Warna sama (${source.color})`);
  }
  const locA = (source.city || source.location || "").toLowerCase();
  const locB = (candidate.city || candidate.location || "").toLowerCase();
  if (locA && locB) {
    if (locA === locB) {
      score += 0.2;
      reasons.push("Lokasi/kota sama");
    } else if (locA.split(" ").some((w) => w.length > 3 && locB.includes(w))) {
      score += 0.1;
      reasons.push("Lokasi terindikasi berdekatan");
    }
  }
  const aTokens = new Set(source.title.toLowerCase().split(/\s+/).filter((t) => t.length > 2));
  const bTokens = candidate.title.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const overlap = bTokens.filter((t) => aTokens.has(t)).length;
  if (overlap > 0) {
    score += Math.min(0.15, overlap * 0.05);
    reasons.push(`Kemiripan kata kunci (${overlap})`);
  }
  if (source.lost_found_date && candidate.lost_found_date) {
    const diff = Math.abs(new Date(source.lost_found_date).getTime() - new Date(candidate.lost_found_date).getTime());
    if (diff < 14 * 864e5) {
      score += 0.1;
      reasons.push("Rentang waktu dekat");
    }
  }
  score = Math.max(0, Math.min(1, score));
  return { score: Number(score.toFixed(2)), reason: reasons.length ? reasons.join(" • ") : "Kecocokan rendah — periksa manual" };
}

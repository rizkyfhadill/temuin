import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Temuin - Platform AI Lost & Found Indonesia",
    short_name: "Temuin",
    description: "Barang hilang? Temuin aja. Platform AI Lost & Find untuk Indonesia.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#DC2626",
    lang: "id",
    categories: ["utilities", "productivity"],
    icons: [
      { src: "/pwa-icon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/pwa-icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/pwa-icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}

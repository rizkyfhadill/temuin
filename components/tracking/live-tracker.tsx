"use client";

import * as React from "react";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, ShieldCheck, X, Navigation } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserSafe } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toaster";

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function LiveTracker({
  open,
  onClose,
  roomId,
  otherName,
}: {
  open: boolean;
  onClose: () => void;
  roomId: string | null;
  otherName: string;
}) {
  const mapEl = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<any>(null);
  const myMarker = React.useRef<any>(null);
  const otherMarker = React.useRef<any>(null);
  const watchRef = React.useRef<number | null>(null);
  const channelRef = React.useRef<any>(null);

  const [myPos, setMyPos] = React.useState<{ lat: number; lng: number } | null>(null);
  const [otherPos, setOtherPos] = React.useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<"idle" | "locating" | "live" | "denied" | "waiting">("idle");

  // Init map + realtime when opened. Leaflet is imported lazily (client-only)
  // so it never touches `window` during SSR/prerender.
  React.useEffect(() => {
    if (!open || !roomId) return;
    const supabase = getSupabaseBrowserSafe();
    if (!supabase) {
      toast.error("Supabase belum terhubung");
      return;
    }

    setStatus("locating");
    let cancelled = false;
    const t = setTimeout(async () => {
      if (cancelled || !mapEl.current) return;
      const L = (await import("leaflet")).default;

      const map = L.map(mapEl.current, { zoomControl: true, attributionControl: true }).setView([-6.2, 106.816], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
      mapRef.current = map;
      map.invalidateSize();

      const channel = supabase
        .channel(`track:${roomId}`)
        .on("broadcast", { event: "loc" }, (payload: any) => {
          const p = payload.payload as { lat: number; lng: number };
          setOtherPos(p);
          if (myPos) setDistance(haversine(myPos, p));
        })
        .subscribe();
      channelRef.current = channel;

      if (navigator.geolocation) {
        watchRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setMyPos(p);
            if (!myMarker.current) {
              myMarker.current = L.marker([p.lat, p.lng], {
                icon: L.divIcon({ html: '<div class="track-dot track-dot--me"></div>', className: "", iconSize: [18, 18], iconAnchor: [9, 9] }),
              }).addTo(map);
            } else {
              myMarker.current.setLatLng([p.lat, p.lng]);
            }
            map.panTo([p.lat, p.lng]);
            setStatus("live");
            channel.send({ type: "broadcast", event: "loc", payload: p });
          },
          () => {
            setStatus("denied");
            toast.error("Izin lokasi ditolak — kamu tetap bisa melihat lokasi lawan.");
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 12000 }
        );
      } else {
        setStatus("denied");
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(t);
      if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
      channelRef.current?.unsubscribe();
      mapRef.current?.remove();
      mapRef.current = null;
      myMarker.current = null;
      otherMarker.current = null;
      setMyPos(null);
      setOtherPos(null);
      setDistance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, roomId]);

  // Reflect the other participant's position on the map.
  React.useEffect(() => {
    if (!mapRef.current || !otherPos) return;
    if (!otherMarker.current) {
      import("leaflet").then(({ default: L }) => {
        if (!mapRef.current || otherMarker.current) return;
        otherMarker.current = L.marker([otherPos.lat, otherPos.lng], {
          icon: L.divIcon({ html: '<div class="track-dot track-dot--other"></div>', className: "", iconSize: [18, 18], iconAnchor: [9, 9] }),
        }).addTo(mapRef.current);
      });
    } else {
      otherMarker.current.setLatLng([otherPos.lat, otherPos.lng]);
    }
  }, [otherPos]);

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg" fullScreenOnMobile>
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <div>
              <h2 className="font-semibold leading-tight">Live Tracking</h2>
              <p className="text-xs text-muted-foreground">Lacak posisi untuk serah terima aman</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="rounded-full p-1.5 text-muted-foreground hover:bg-accent">
            <X className="size-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-2 text-xs text-primary">
            <ShieldCheck className="size-4 shrink-0" />
            Lakukan serah terima di tempat umum yang aman. Jangan bagikan alamat rumah.
          </div>

          <div ref={mapEl} className="mt-3 h-72 w-full overflow-hidden rounded-xl border border-border bg-muted" />

          <div className="mt-3 space-y-1.5 text-sm">
            <p className="flex items-center gap-2">
              <span className="track-dot track-dot--me !relative !inline-block" /> Posisi kamu:
              {status === "locating" && <><Loader2 className="size-3.5 animate-spin" /> Mencari GPS…</>}
              {status === "denied" && <span className="text-destructive">izin ditolak</span>}
              {status === "live" && myPos && <span className="text-muted-foreground">{myPos.lat.toFixed(5)}, {myPos.lng.toFixed(5)}</span>}
            </p>
            <p className="flex items-center gap-2">
              <span className="track-dot track-dot--other !relative !inline-block" /> @{otherName}:
              {otherPos ? (
                <span className="text-muted-foreground">{otherPos.lat.toFixed(5)}, {otherPos.lng.toFixed(5)}</span>
              ) : (
                <span className="text-muted-foreground">menunggu lokasi…</span>
              )}
            </p>
            {distance != null && (
              <p className="flex items-center gap-2 font-medium">
                <Navigation className="size-4 text-primary" /> Jarak: {distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(2)} km`}
              </p>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}

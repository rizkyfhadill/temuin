"use client";

import * as React from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = React.useState(false);

  const share = async () => {
    const full = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
    try {
      if (navigator.share) {
        await navigator.share({ title, url: full });
        return;
      }
      await navigator.clipboard.writeText(full);
      setCopied(true);
      toast.success("Tautan disalin ke clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={share}>
      {copied ? <Check className="size-4" /> : <Share2 className="size-4" />} Bagikan
    </Button>
  );
}

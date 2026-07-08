"use client";

import * as React from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const Icon = !mounted ? Sun : theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;

  return (
    <button
      onClick={cycle}
      aria-label="Ubah tema"
      title="Ubah tema (Terang / Gelap / Sistem)"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent",
        className
      )}
    >
      <Icon className="size-[18px]" />
    </button>
  );
}

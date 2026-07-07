import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { PWARegister } from "@/components/providers/pwa-register";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Temuin — Platform AI Lost & Found Indonesia",
    template: "%s · Temuin",
  },
  description:
    "Barang hilang? Temuin aja. Platform AI Lost & Found untuk Indonesia dengan pencocokan cerdas, chat aman, dan verifikasi admin.",
  keywords: ["lost and found", "barang hilang", "temuin", "lost found indonesia", "ai match"],
  applicationName: "Temuin",
  icons: {
    icon: "/temuin-logo.png",
    shortcut: "/temuin-logo.png",
    apple: "/temuin-logo.png",
  },
  openGraph: {
    title: "Temuin — Platform AI Lost & Found Indonesia",
    description: "Barang hilang? Temuin aja.",
    type: "website",
    locale: "id_ID",
    siteName: "Temuin",
  },
  twitter: { card: "summary_large_image", title: "Temuin", description: "Barang hilang? Temuin aja." },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
              <PWARegister />
            </AuthProvider>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}

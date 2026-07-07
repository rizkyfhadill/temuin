"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toaster";

export function LoginMessage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle auth messages from callback
    const message = searchParams.get("message");
    const error = searchParams.get("error");

    if (message === "password_reset_success") {
      toast.success("Password berhasil diubah. Silakan login dengan password baru Anda.");
    } else if (message === "email_confirmed") {
      toast.success("Email berhasil diverifikasi. Silakan login.");
    }

    if (error === "auth_callback_failed") {
      toast.error("Link verifikasi tidak valid atau telah kadaluarsa. Silakan coba lagi.");
    } else if (error === "oauth_callback_failed") {
      toast.error("Login dengan Google gagal. Silakan coba lagi.");
    }
  }, [searchParams]);

  return null;
}

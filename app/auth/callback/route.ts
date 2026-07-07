import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Handles OAuth (Google, PKCE), email confirmation, and password reset.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await getSupabaseServer();

  // PKCE flow (Google OAuth, and email links configured for PKCE).
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
  }

  // Token-hash flow (Supabase email confirmation / password reset).
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      // Password reset successful - redirect to login with message
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/login?message=password_reset_success`);
      }
      // Email confirmation successful - redirect to login
      if (type === "signup") {
        return NextResponse.redirect(`${origin}/login?message=email_confirmed`);
      }
      // Default: redirect to next or dashboard
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets & internal routes.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });

  if (!url || !key) return response; // No backend configured → let pages degrade gracefully.

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname.startsWith("/(auth)") || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot");

  // If user is logged in and trying to access auth pages, redirect to appropriate dashboard
  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    const redirect = request.nextUrl.clone();
    redirect.pathname = profile?.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(redirect);
  }

  if (isDashboard && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", pathname);
    return NextResponse.redirect(redirect);
  }

  if (isAdmin) {
    if (!user) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/login";
      redirect.searchParams.set("next", pathname);
      return NextResponse.redirect(redirect);
    }
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (error || profile?.role !== "admin") {
      // Non-admin trying to reach admin: send to their dashboard.
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/dashboard";
      return NextResponse.redirect(redirect);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot",
    "/(auth)/:path*",
  ],
};

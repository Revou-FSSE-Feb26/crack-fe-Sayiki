import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to decode JWT payload without external libraries on the Edge runtime
function parseJwt(token: string): { sub?: string; email?: string; role?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const tokenCookie = request.cookies.get("token")?.value;
  const roleCookie = request.cookies.get("user_role")?.value;

  // Extract role from JWT token payload or cookie
  let role = roleCookie;
  if (tokenCookie) {
    const payload = parseJwt(tokenCookie);
    if (payload?.role) {
      role = payload.role;
    }
  }

  const isAuthenticated = Boolean(tokenCookie);

  // 1. Modder Studio Workbench Protection (/modder/:path*)
  if (pathname.startsWith("/modder")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role Guard: Customer is strictly forbidden from accessing modder workbench!
    if (role !== "MODDER" && role !== "ADMIN") {
      const ordersUrl = new URL("/orders", request.url);
      ordersUrl.searchParams.set("error", "unauthorized_modder_access");
      return NextResponse.redirect(ordersUrl);
    }
  }

  // 2. Admin Escrow Vault Protection (/admin/:path*)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role Guard: Strictly ADMIN only!
    if (role !== "ADMIN") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(homeUrl);
    }
  }

  // 3. Customer Orders & Live Escrow Tracker (/orders/:path*)
  if (pathname.startsWith("/orders")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Cart & Checkout (/cart)
  if (pathname.startsWith("/cart")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Auth Pages (/login, /register) - Redirect already logged in users
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (role === "MODDER") {
        return NextResponse.redirect(new URL("/modder/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/orders", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/modder/:path*",
    "/admin/:path*",
    "/orders/:path*",
    "/cart",
    "/login",
    "/register",
  ],
};

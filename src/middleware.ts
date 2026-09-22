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

  const rawToken = request.cookies.get("token")?.value;
  const rawRole = request.cookies.get("user_role")?.value;

  const tokenCookie = rawToken ? decodeURIComponent(rawToken) : undefined;
  const roleCookie = rawRole ? decodeURIComponent(rawRole) : undefined;

  // Extract role from JWT token payload or fallback to role cookie
  let role = roleCookie;
  if (tokenCookie && tokenCookie !== "undefined" && tokenCookie !== "null") {
    const payload = parseJwt(tokenCookie);
    if (payload?.role) {
      role = payload.role;
    }
  }

  const hasValidToken = Boolean(
    tokenCookie &&
    tokenCookie !== "undefined" &&
    tokenCookie !== "null" &&
    tokenCookie.trim() !== ""
  );

  const isAuthenticated = hasValidToken || Boolean(roleCookie && roleCookie.trim() !== "");
  const normalizedRole = (role || roleCookie || "").toUpperCase();

  // Helper to construct unauthenticated redirect to /login (safe, does not delete cookies)
  const redirectToLogin = (targetPath: string) => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", targetPath);
    return NextResponse.redirect(loginUrl);
  };

  // Explicitly ensure /modders public directory & modder profiles are 100% accessible to anyone!
  if (pathname === "/modders" || pathname.startsWith("/modders/")) {
    return NextResponse.next();
  }

  // 1. Modder Studio Workbench Protection (/modder/:path*)
  if (pathname === "/modder" || pathname.startsWith("/modder/")) {
    if (!isAuthenticated) {
      return redirectToLogin(pathname);
    }

    // Role Guard: Customers are strictly forbidden from modder workbench
    if (normalizedRole !== "MODDER" && normalizedRole !== "ADMIN") {
      const ordersUrl = new URL("/orders", request.url);
      ordersUrl.searchParams.set("error", "unauthorized_modder_access");
      return NextResponse.redirect(ordersUrl);
    }
  }

  // 2. Admin Escrow Vault Protection (/admin/:path*)
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return redirectToLogin(pathname);
    }

    // Role Guard: Strictly ADMIN only
    if (normalizedRole !== "ADMIN") {
      const homeUrl = new URL("/", request.url);
      homeUrl.searchParams.set("error", "unauthorized_admin_access");
      return NextResponse.redirect(homeUrl);
    }
  }

  // 3. Auth Pages (/login, /register) - Redirect away only if authenticated
  if (pathname === "/login" || pathname === "/register") {
    if (isAuthenticated) {
      const redirectTarget = request.nextUrl.searchParams.get("redirect");
      if (
        redirectTarget &&
        !redirectTarget.startsWith("/login") &&
        !redirectTarget.startsWith("/register")
      ) {
        if (redirectTarget.startsWith("/modder") && normalizedRole !== "MODDER" && normalizedRole !== "ADMIN") {
          return NextResponse.redirect(new URL("/orders", request.url));
        }
        if (redirectTarget.startsWith("/admin") && normalizedRole !== "ADMIN") {
          return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.redirect(new URL(redirectTarget, request.url));
      }

      if (normalizedRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", request.url));
      } else if (normalizedRole === "MODDER") {
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
    "/login",
    "/register",
  ],
};

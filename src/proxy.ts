import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE || "user";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (APP_MODE === "admin") {
    // Admin deploy: allow /admin/*, /api/*, /login, and static assets
    const isAllowed =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api/") ||
      pathname === "/login" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/public");

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (APP_MODE === "user") {
    // User deploy: block /admin/* pages and /api/admin/* routes
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname.startsWith("/api/admin")) {
      return Response.json(
        { success: false, error: "Not available" },
        { status: 404 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // allow public assets and api
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.startsWith("/public")) {
    return NextResponse.next();
  }
  // allow auth, signup
  if (pathname.startsWith("/auth") || pathname.startsWith("/signup")) {
    return NextResponse.next();
  }
  const hasUser = req.cookies.get("cm_user")?.value;
  if (!hasUser) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};



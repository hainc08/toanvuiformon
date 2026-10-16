import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for admin pages: redirect to login when no session cookie is present.
 * The real authentication/authorization check happens server-side (requireAdminPage / requireApiUser).
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !req.cookies.has("tv_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };

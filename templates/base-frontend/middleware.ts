import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/posts"];
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = request.cookies.get("logged_in")?.value === "true";

  // Redirect unauthenticated users away from protected routes
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/posts/:path*", "/login", "/register"],
};

// ~/middleware.ts
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { UserRole } from "~/server/auth/config";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;
  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  // Public routes - no authentication needed
  if (
    nextUrl.pathname.startsWith("/") ||
    nextUrl.pathname.startsWith("/menu") ||
    nextUrl.pathname.startsWith("/cart")
  ) {
    return NextResponse.next();
  }

  // Redirect from auth pages if already logged in
  if (isAuthPage && isLoggedIn) {
    // Redirect based on role
    if (session?.user?.role === UserRole.ADMIN) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    } else {
      return NextResponse.redirect(new URL("/owner", nextUrl));
    }
  }

  // Require authentication for admin and owner routes
  if (
    !isLoggedIn &&
    (nextUrl.pathname.startsWith("/admin") ||
      nextUrl.pathname.startsWith("/owner"))
  ) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Admin route protection
  if (
    nextUrl.pathname.startsWith("/admin") &&
    session?.user.role !== UserRole.ADMIN
  ) {
    // Redirect owners to their dashboard
    if (session?.user.role === UserRole.FOODCOURT_OWNER) {
      return NextResponse.redirect(new URL("/owner", nextUrl));
    }
    // Otherwise redirect to home
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Owner route protection
  if (
    nextUrl.pathname.startsWith("/owner") &&
    session?.user.role !== UserRole.FOODCOURT_OWNER &&
    session?.user.role !== UserRole.ADMIN
  ) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

// Matcher config - exclude public assets and API routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
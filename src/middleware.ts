import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/projects",
    "/tasks",
    "/issues",
    "/qa",
    "/users",
    "/reports",
    "/settings",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // For now, allow all routes to pass through
  // TODO: Implement proper auth check after fixing edge runtime issues
  if (isProtectedRoute) {
    // In production, implement proper auth check here
    // For development, we'll check auth in the pages/components themselves
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // If user is authenticated and on the root, login, or register page, redirect to dashboard
    if (
      req.nextauth.token &&
      ['/', '/login', '/register'].includes(req.nextUrl.pathname)
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  },
  {
    callbacks: {
      // The default `authorized` callback checks for the presence of a token.
      // If a token exists, the user is authorized.
      authorized: ({ token }) => !!token,
    },
    // Configure the login page.
    // Unauthenticated users will be redirected to this page.
    pages: {
      signIn: '/login',
    },
  }
);

// Apply middleware to all relevant pages
export const config = {
  matcher: [
    '/', // The root page
    // All protected routes that require authentication
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/projects/:path*',
    '/tasks/:path*',
    '/timesheet/:path*',
    '/todos/:path*',
    '/calendar/:path*',
    // The auth routes, to handle redirects for already authenticated users
    '/login',
    '/register',
  ],
};

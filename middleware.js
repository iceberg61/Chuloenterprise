import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// ✅ Routes that require login
const protectedRoutes = ['/orders', '/dashboard', '/profile', '/fundaccount'];
// ✅ Routes that require admin access
const adminRoutes = ['/admin'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    !protectedRoutes.some(route => pathname.startsWith(route)) &&
    !adminRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // ✅ Read token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    // No token → redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Check admin route access
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url)); // 🚫 Non-admin redirected
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error('JWT Error:', err);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/orders/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/fundaccount/:path*',
    '/admin/:path*', // 👈 include admin routes
  ],
  runtime: 'nodejs',
};

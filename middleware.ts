import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access - actual permission check will be done in page component
    // This allows the page to check permissions via API and show proper UI
    // The page component will handle redirect if user is not admin
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}


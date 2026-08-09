import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Placeholder role-gated middleware for staff portals
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/clinic/:path*",
    "/doctor/:path*",
    "/receptionist/:path*",
  ],
};

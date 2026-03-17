import { auth } from "@/auth"
import { createClient } from "@/utils/supabase/proxy"
import { NextResponse } from "next/server"

export default auth(async (req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")

  // Redirect to login if not logged in and trying to access a protected route
  if (!isLoggedIn && !isAuthPage) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If logged in and on an auth page, redirect to home
  if (isLoggedIn && isAuthPage) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Handle Supabase SSR cookie refresh and session management
  return createClient(req);
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

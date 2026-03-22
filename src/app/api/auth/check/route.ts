import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    const userCookie = cookieStore.get("admin_user");

    // Must have valid session cookie
    if (session?.value !== "authenticated") {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    // Must have user info cookie - NO FALLBACK
    // This prevents session hijacking where someone could have a valid session
    // but appear as a different user
    if (!userCookie?.value) {
      // Session exists but no user info - invalid state, clear session
      const response = NextResponse.json({
        authenticated: false,
        user: null
      });
      response.cookies.delete('admin_session');
      response.cookies.delete('admin_user');
      return response;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      return NextResponse.json({
        authenticated: true,
        user
      });
    } catch {
      // Corrupted cookie - clear everything
      const response = NextResponse.json({
        authenticated: false,
        user: null
      });
      response.cookies.delete('admin_session');
      response.cookies.delete('admin_user');
      return response;
    }

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      user: null
    });
  }
}
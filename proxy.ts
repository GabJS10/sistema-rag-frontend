import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/constants";

const protectedRoutes = ["/"];

const checkIsProtectedRoute = (path: string) => {
  return protectedRoutes.includes(path);
};

export async function proxy(req: NextRequest) {
  const currentPath = req.nextUrl.pathname;

  const isProtectedRoute = checkIsProtectedRoute(currentPath);

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const cookieStore = await cookies();

  const accesToken = cookieStore.get("access_token");

  if (!accesToken) {
    const refreshToken = cookieStore.get("refresh_token");

    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const refreshTokenValue = refreshToken.value;

    const res = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshTokenValue }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      sameSite: "strict",
      //maxAge 15 minutes
      maxAge: 60 * 15,
    });
    cookieStore.set("refresh_token", data.refresh_token, {
      httpOnly: true,
      sameSite: "strict",
      //maxAge 15 minutes
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.redirect(new URL(currentPath, req.url));
  }

  return NextResponse.next();
}

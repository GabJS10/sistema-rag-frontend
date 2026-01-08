import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
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
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const accessToken = accesToken.value;

  const decodedToken = jwt.decode(accessToken);

  if (!decodedToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const isTokenExpired =
    (decodedToken as { exp: number }).exp < Date.now() / 1000;

  if (isTokenExpired) {
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
      console.log(data);
      return NextResponse.redirect(new URL("/login", req.url));
    }

    cookieStore.set("access_token", data.access_token);
    cookieStore.set("refresh_token", data.refresh_token);

    return NextResponse.redirect(new URL(currentPath, req.url));
  }

  return NextResponse.next();
}

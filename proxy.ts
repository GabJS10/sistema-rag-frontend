import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

  //check if the access token is expired
  const accessToken = accesToken.value;

  const decodedToken = jwt.decode(accessToken);

  if (!decodedToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const isTokenExpired =
    (decodedToken as { exp: number }).exp < Date.now() / 1000;

  console.log(isTokenExpired);

  if (isTokenExpired) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

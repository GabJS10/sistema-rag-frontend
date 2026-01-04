import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/schemas/login";
import { API_URL } from "@/lib/constants";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const validateBody = loginSchema.safeParse(body);

  if (!validateBody.success) {
    return NextResponse.json(
      { error: validateBody.error.issues[0].message },
      { status: 400 }
    );
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { error: errorData.detail },
      { status: response.status }
    );
  }

  const res = await response.json();

  const cookieStore = await cookies();
  cookieStore.set("access_token", res.access_token, {
    httpOnly: true,
    sameSite: "strict",
  });
  cookieStore.set("refresh_token", res.refresh_token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/api/refresh",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ message: "Login exitoso" }, { status: 200 });
}

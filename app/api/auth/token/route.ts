import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    return NextResponse.json(
      { error: "No authenticated session" },
      { status: 401 }
    );
  }

  return NextResponse.json({ token: token.value });
}

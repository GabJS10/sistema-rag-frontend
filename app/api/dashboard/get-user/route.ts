import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/constants";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/dashboard/get-user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.value}`,
      },
    });

    if (!response.ok) {
        // If 401, maybe try refresh token here (future improvement)
        return NextResponse.json({ error: "Failed to fetch user" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Error proxying user request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
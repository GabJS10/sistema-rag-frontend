import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/constants";
export async function POST(request: Request) {
  try {
    const { document_id } = await request.json();

    if (!document_id) {
      return NextResponse.json(
        { detail: "document_id is required" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ detail: "No autorizado" }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/supabase/embedding`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ document_id }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { detail: data.detail || "Error generating embeddings" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in embedding proxy route:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 },
    );
  }
}

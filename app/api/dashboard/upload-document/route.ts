import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/constants";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    return NextResponse.json(
      { error: "No authenticated session" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    
    // We send the FormData directly to FastAPI
    const response = await fetch(`${API_URL}/supabase/upload_document_to_supabase`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token.value}`,
        // Note: We don't set Content-Type manually when using FormData
        // fetch will automatically set it to multipart/form-data with the correct boundary
      },
      body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend error:", errorText);
        return NextResponse.json(
            { error: `Backend error: ${response.statusText}` },
            { status: response.status }
        );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

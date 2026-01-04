import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { registerSchema } from "@/schemas/register";
import { API_URL } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const validateBody = registerSchema.safeParse(body);

  if (!validateBody.success) {
    return NextResponse.json(
      { error: validateBody.error.issues[0].message },
      { status: 400 }
    );
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();

    return NextResponse.json(
      { error: errorData.detail },
      { status: response.status }
    );
  }

  return NextResponse.json({ message: "Hello, world!" });
}

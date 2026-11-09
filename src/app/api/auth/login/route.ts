import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema, verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 2. Lookup user in PostgreSQL
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // 3. Verify password against hashed password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // 4. Create signed session token and set HTTP-only cookie
    const sessionToken = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: "Signed in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign-in. Please try again." },
      { status: 500 }
    );
  }
}

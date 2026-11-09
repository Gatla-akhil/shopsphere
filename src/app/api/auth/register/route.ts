import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate request body against schema
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const issues = validation.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return NextResponse.json(
        {
          error: issues[0]?.message || "Invalid input data",
          details: issues,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // 2. Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please log in instead." },
        { status: 409 }
      );
    }

    // 3. Hash password securely (bcrypt salt rounds = 12)
    const passwordHash = await hashPassword(password);

    // 4. Create new customer user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Customer account created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again later." },
      { status: 500 }
    );
  }
}


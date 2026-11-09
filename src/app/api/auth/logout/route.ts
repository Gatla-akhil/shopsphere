import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to sign out. Please try again." },
      { status: 500 }
    );
  }
}

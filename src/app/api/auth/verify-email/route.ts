// ~/app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { UserRole } from "~/server/auth/config";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verification-error?error=invalid-token", request.url),
      );
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/verification-error?error=invalid-token", request.url),
      );
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      return NextResponse.redirect(
        new URL("/verification-error?error=token-expired", request.url),
      );
    }

    // Find the user by email
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/verification-error?error=user-not-found", request.url),
      );
    }

    // Update user's email verification status
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Delete the verification token
    await db.verificationToken.delete({
      where: { token },
    });

    // Redirect based on user role
    const redirectUrl = getRedirectUrlByRole(user.role as UserRole);

    // Add verified flag to indicate successful verification
    const finalRedirectUrl = new URL(
      `${redirectUrl}?verified=true`,
      request.url,
    );

    return NextResponse.redirect(finalRedirectUrl);
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/verification-error?error=server-error", request.url),
    );
  }
}

// Helper function to determine redirect URL based on user role
function getRedirectUrlByRole(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.FOODCOURT_OWNER:
      return "/owner";
    case UserRole.CUSTOMER:
    default:
      return "/login"; // Regular customers go to login page after verification
  }
}

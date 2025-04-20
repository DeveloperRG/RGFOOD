// ~/app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { Resend } from "resend";
import { z } from "zod";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Define request schema
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = emailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 },
      );
    }

    const { email } = result.data;

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return NextResponse.json(
        {
          message:
            "If your email is registered, a verification link has been sent.",
        },
        { status: 200 },
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email is already verified. Please login." },
        { status: 400 },
      );
    }

    // Delete any existing verification tokens for this user
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Create a new verification token
    const verificationToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    // Log the attempt to send an email for debugging
    console.log("Attempting to resend verification email to:", email);

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;

    await resend.emails
      .send({
        from: "onboarding@resend.dev", // Use this for testing or your verified domain
        to: email,
        subject: "Verify your FoodCourt account",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #333;">FoodCourt Email Verification</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <p>Hello ${user.name || "there"},</p>
            <p>You requested a new verification link. To verify your email address, please click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; font-size: 14px;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not request this verification link, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} FoodCourt. All rights reserved.</p>
          </div>
        </div>
      `,
      })
      .then(() => {
        console.log("Verification email sent successfully to:", email);
      })
      .catch((emailError) => {
        console.error("Email sending error details:", emailError);
        throw emailError; // Re-throw to be caught by the outer try/catch
      });

    return NextResponse.json(
      { message: "Verification email sent. Please check your inbox." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Failed to send verification email" },
      { status: 500 },
    );
  }
}

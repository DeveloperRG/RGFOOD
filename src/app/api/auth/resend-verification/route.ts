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

    console.log("Created new verification token:", verificationToken);
    console.log("For user:", email);

    // Send verification email
    try {
      console.log("Attempting to resend verification email to:", email);
      const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;
      console.log("Using verification URL:", verificationUrl);
      console.log(
        "Using Resend API key:",
        process.env.RESEND_API_KEY ? "Key is set" : "Key is missing",
      );

      const data = await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
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
      });

      console.log("Email sent successfully, response:", data);

      return NextResponse.json(
        { message: "Verification email sent. Please check your inbox." },
        { status: 200 },
      );
    } catch (error) {
      console.error("Resend verification error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Extract detailed error information for debugging
      const errorDetails =
        error instanceof Error
          ? {
              message: error.message,
              name: error.name,
              stack: error.stack,
            }
          : "Unknown error type";

      // Check for specific error types
      let errorMessage = "Failed to send verification email";

      if (error instanceof Error) {
        if (error.message.includes("authentication")) {
          errorMessage =
            "Email authentication failed. Check your Resend API key.";
        } else if (error.message.includes("rate limit")) {
          errorMessage = "Email rate limit exceeded. Please try again later.";
        } else if (error.message.includes("network")) {
          errorMessage =
            "Network error occurred when sending email. Check your internet connection.";
        }
      }

      return NextResponse.json(
        {
          message: errorMessage,
          error: error instanceof Error ? error.message : "Unknown error",
          details: errorDetails,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { message: "Failed to send verification email" },
      { status: 500 },
    );
  }
}

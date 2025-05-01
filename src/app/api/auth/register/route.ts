// ~/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "~/server/db";
import { UserRole } from "~/server/auth/config";
import { z } from "zod";
import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Define a schema for user registration validation
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z
    .enum([UserRole.ADMIN, UserRole.OWNER, UserRole.CUSTOMER])
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input data
    const result = userSchema.safeParse(body);

    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      password,
      role = UserRole.OWNER,
    } = result.data;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create verification token
    const verificationToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with specified role, but with emailVerified set to null
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        emailVerified: null, // User needs to verify email
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Create verification token in database
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;

      console.log("Attempting to send verification email to:", email);
      console.log("Using verification URL:", verificationUrl);
      console.log(
        "Using Resend API key:",
        process.env.RESEND_API_KEY ? "Key is set" : "Key is missing",
      );
      console.log("Verification token created:", verificationToken);

      const data = await resend.emails.send({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: email,
        subject: "Verify your FoodCourt account",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #333;">Welcome to FoodCourt!</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <p>Hello ${name},</p>
            <p>Thank you for registering with FoodCourt. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; font-size: 14px;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not sign up for a FoodCourt account, please ignore this email.</p>
          </div>
          <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
            <p>&copy; ${new Date().getFullYear()} FoodCourt. All rights reserved.</p>
          </div>
        </div>
        `,
      });

      console.log("Email sent successfully, response:", data);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      console.error("Error details:", JSON.stringify(emailError, null, 2));

      // Check for specific error types
      let errorMessage =
        "User registered but verification email failed to send.";

      if (emailError instanceof Error) {
        if (emailError.message.includes("authentication")) {
          errorMessage =
            "Email authentication failed. Check your Resend API key.";
        } else if (emailError.message.includes("rate limit")) {
          errorMessage = "Email rate limit exceeded. Please try again later.";
        } else if (emailError.message.includes("network")) {
          errorMessage =
            "Network error occurred when sending email. Check your internet connection.";
        }
      }

      // Instead of silently continuing, return an error to the client
      return NextResponse.json(
        {
          message: errorMessage,
          error:
            emailError instanceof Error ? emailError.message : "Unknown error",
          user: user, // Return user info so they can try verifying again later
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "User registered successfully. Please verify your email.",
        user,
        requiresVerification: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 },
    );
  }
}

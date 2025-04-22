// ~/app/api/debug-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: Request) {
  // Create a simple response object to track what's happening
  const debugInfo: {
    resendApiKey: string;
    emailFrom: string;
    nextAuthUrl: string;
    emailServerSettings: {
      host: string;
      port: string;
      user: string;
      pass: string;
    };
    serverTime: string;
    emailResponse: any; // Changed from null to any
    error: any; // Changed from null to any
  } = {
    resendApiKey: process.env.RESEND_API_KEY ? "Present" : "Missing",
    emailFrom: process.env.EMAIL_FROM || "Using default: onboarding@resend.dev",
    nextAuthUrl: process.env.NEXTAUTH_URL || "Missing NEXTAUTH_URL",
    emailServerSettings: {
      host: process.env.EMAIL_SERVER_HOST || "Not set",
      port: process.env.EMAIL_SERVER_PORT || "Not set",
      user: process.env.EMAIL_SERVER_USER ? "Present" : "Missing",
      pass: process.env.EMAIL_SERVER_PASSWORD ? "Present" : "Missing",
    },
    serverTime: new Date().toISOString(),
    emailResponse: null,
    error: null,
  };

  try {
    // Initialize Resend with your API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get test email from query params or use a default
    const url = new URL(request.url);
    const testEmail = url.searchParams.get("email") || "test@example.com";

    console.log(`Attempting to send debug email to: ${testEmail}`);

    // Attempt to send a test email
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: testEmail,
      subject: "FoodCourt Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>This is a test email</h1>
          <p>If you're seeing this, your Resend setup is working correctly.</p>
          <p>Environment check:</p>
          <ul>
            <li>Resend API Key: ${debugInfo.resendApiKey}</li>
            <li>Email From: ${debugInfo.emailFrom}</li>
            <li>NEXTAUTH_URL: ${debugInfo.nextAuthUrl}</li>
            <li>Server Time: ${debugInfo.serverTime}</li>
            <li>SMTP Host: ${debugInfo.emailServerSettings.host}</li>
            <li>SMTP Port: ${debugInfo.emailServerSettings.port}</li>
          </ul>
        </div>
      `,
    });

    console.log("Debug email sent successfully:", data);
    debugInfo.emailResponse = data;

    return NextResponse.json(
      {
        message: "Debug email sent successfully",
        debugInfo,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to send debug email:", error);

    debugInfo.error =
      error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
          }
        : "Unknown error type";

    return NextResponse.json(
      {
        message: "Failed to send debug email",
        debugInfo,
      },
      { status: 500 },
    );
  }
}

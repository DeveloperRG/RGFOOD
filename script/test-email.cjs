// ~/scripts/test-email.js
// A simple script to test your Resend email configuration
// Run with: node scripts/test-email.js

const { Resend } = require("resend");

// Initialize with your API key
const resend = new Resend(
  process.env.RESEND_API_KEY || "re_h6MU9jtR_LoLjhZiMZny4E1gKoBbTEwqd",
);

// Test email address - replace with your own
const testEmail = process.argv[2] || "nugrohoogi512@gmail.com";

async function sendTestEmail() {
  console.log(`Attempting to send test email to: ${testEmail}`);

  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: testEmail,
      subject: "Test Email from FoodCourt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Email Test Successful!</h1>
          <p>If you're seeing this, your Resend email configuration is working correctly.</p>
          <p>This email was sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log("Email sent successfully!");
    console.log("Response data:", data);
  } catch (error) {
    console.error("Failed to send email:");
    console.error(error);
  }
}

// Execute the function
sendTestEmail();

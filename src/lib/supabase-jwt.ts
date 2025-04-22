// src/lib/supabase-jwt.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { type Database } from "~/types/supabase";

/**
 * This middleware sets up the Supabase client to use the Next Auth JWT
 * so that the RLS policies can identify the authenticated user
 */
export async function supabaseMiddleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create supabase middleware client
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Get token from Next Auth
  const token = await getToken({ req });

  if (token) {
    // Set custom claims for Supabase RLS
    await supabase.auth.setSession({
      access_token: token.sub as string, // User ID from Next Auth
      refresh_token: "",
    });
  }

  return res;
}

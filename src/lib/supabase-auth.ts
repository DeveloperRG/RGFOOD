// src/lib/supabase-auth.ts
import { type Session } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import { type Database } from "~/types/supabase";

/**
 * Creates a Supabase client with the user's session token
 * This allows RLS policies to work with Next Auth authentication
 */
export function createClientWithAuth(session: Session | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: session?.user ? `Bearer ${session.user.id}` : "",
        },
      },
    }
  );
}

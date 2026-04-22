import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SupabaseHealthResponse = {
  ok: boolean;
  service: "supabase";
  timestamp: string;
  checks: {
    clientInitialized: boolean;
    adminApiReachable: boolean;
  };
  error?: string;
};

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(
      {
        ok: true,
        service: "supabase",
        timestamp,
        checks: {
          clientInitialized: true,
          adminApiReachable: true
        }
      } satisfies SupabaseHealthResponse,
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase health check error";

    return NextResponse.json(
      {
        ok: false,
        service: "supabase",
        timestamp,
        checks: {
          clientInitialized: false,
          adminApiReachable: false
        },
        error: message
      } satisfies SupabaseHealthResponse,
      { status: 503 }
    );
  }
}

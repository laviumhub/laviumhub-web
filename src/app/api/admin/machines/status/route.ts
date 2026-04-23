import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { listMachineStatuses } from "@/features/machines/server/machine-status-store";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const snapshot = await listMachineStatuses();
    return NextResponse.json(
      {
        ok: true,
        data: snapshot.rows,
        source_timestamp: snapshot.latestSourceTimestamp,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load machine status.";
    return NextResponse.json({ ok: false, message, data: [] }, { status: 500 });
  }
}

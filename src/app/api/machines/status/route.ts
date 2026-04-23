import { NextResponse } from "next/server";

import { listMachineStatuses } from "@/features/machines/server/machine-status-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL_HEADER = "public, s-maxage=30, stale-while-revalidate=60";

export async function GET() {
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
          "Cache-Control": CACHE_CONTROL_HEADER,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch machine status.";
    return NextResponse.json(
      {
        ok: false,
        message,
        data: [],
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

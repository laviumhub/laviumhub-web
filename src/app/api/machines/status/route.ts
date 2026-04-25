import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getMachineRefreshMeta,
  listPublicMachineStatuses,
  listPublicMachineStatusesChangedSince,
} from "@/features/machines/server/machine-status-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL_HEADER = "no-store, max-age=0";

function isValidIsoDate(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

export async function GET(request: NextRequest) {
  try {
    const meta = await getMachineRefreshMeta();
    const ifNoneMatch = request.headers.get("if-none-match");
    if (meta.etag && ifNoneMatch === meta.etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "Cache-Control": CACHE_CONTROL_HEADER,
          ETag: meta.etag,
        },
      });
    }

    const since = request.nextUrl.searchParams.get("since");
    const useDelta = Boolean(since && isValidIsoDate(since));
    const rows = useDelta
      ? await listPublicMachineStatusesChangedSince(String(since))
      : await listPublicMachineStatuses();

    return NextResponse.json(
      {
        ok: true,
        mode: useDelta ? "delta" : "full",
        changed: useDelta ? rows.length > 0 : true,
        data: rows,
        refresh_timestamp: meta.refreshTimestamp,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": CACHE_CONTROL_HEADER,
          ...(meta.etag ? { ETag: meta.etag } : {}),
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

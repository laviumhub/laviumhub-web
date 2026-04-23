import { NextResponse } from "next/server";

import DEFAULT_MACHINES from "@/data/json/default-machines.json";
import type { RawMachineRecord } from "@/data/types/raw-machine";
import { listMachineStatuses } from "@/features/machines/server/machine-status-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL_HEADER = "public, s-maxage=30, stale-while-revalidate=60";

type ScraperResponse = {
  success: boolean;
  count?: number;
  data?: RawMachineRecord[];
  timestamp: string;
  error?: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function mergeWithCatalog(statusRows: { device_id: string; status: string; state: string }[]): RawMachineRecord[] {
  const map = new Map<string, { status: string; state: string }>();
  for (const row of statusRows) {
    map.set(row.device_id, {
      status: row.status,
      state: row.state,
    });
  }

  const catalog = DEFAULT_MACHINES as RawMachineRecord[];
  return catalog.map((item) => {
    const latest = map.get(item.device_id);
    return {
      ...item,
      status: latest?.status ?? item.status,
      state: latest?.state ?? item.state,
    } satisfies RawMachineRecord;
  });
}

function withPublicCacheHeaders(payload: ScraperResponse, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      "Cache-Control": CACHE_CONTROL_HEADER,
    },
  });
}

export async function GET(request: Request) {
  const timestamp = nowIso();

  const expectedApiKey = process.env.SCRAPER_API_KEY;
  if (expectedApiKey) {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("key") ?? "";
    if (apiKey !== expectedApiKey) {
      return withPublicCacheHeaders(
        {
          success: false,
          error: "Forbidden: invalid API key",
          timestamp,
        } satisfies ScraperResponse,
        403
      );
    }
  }

  try {
    const snapshot = await listMachineStatuses();
    const machines = mergeWithCatalog(snapshot.rows);

    return withPublicCacheHeaders(
      {
        success: true,
        count: machines.length,
        data: machines,
        timestamp: snapshot.latestSourceTimestamp ?? timestamp,
      } satisfies ScraperResponse,
      200
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch machine statuses";

    return withPublicCacheHeaders(
      {
        success: false,
        error: message,
        timestamp,
      } satisfies ScraperResponse,
      500
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { refreshMachineStatuses } from "@/features/machines/server/machine-status-refresh";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.MACHINE_REFRESH_JOB_TOKEN ?? "";
  if (!expected) return false;

  const headerToken = request.headers.get("x-machine-refresh-token") ?? "";
  const queryToken = request.nextUrl.searchParams.get("token") ?? "";
  return headerToken === expected || queryToken === expected;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshMachineStatuses({ force: false });
    return NextResponse.json(
      {
        ok: true,
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh machine status.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

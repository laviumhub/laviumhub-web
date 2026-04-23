import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { refreshMachineStatuses } from "@/features/machines/server/machine-status-refresh";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RefreshPayload = {
  token?: string;
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const payload = (await request.json()) as RefreshPayload;
    const providedToken = String(payload.token ?? "").trim();
    const expectedToken = process.env.MACHINES_REFRESH_TOKEN ?? "";

    if (!expectedToken) {
      return NextResponse.json(
        { ok: false, message: "MACHINES_REFRESH_TOKEN is not configured on the server." },
        { status: 500 }
      );
    }

    if (!providedToken || providedToken !== expectedToken) {
      return NextResponse.json({ ok: false, message: "Invalid refresh token." }, { status: 403 });
    }

    const result = await refreshMachineStatuses({ force: true });
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to refresh machine status.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

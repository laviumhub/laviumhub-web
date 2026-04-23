import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { moveBannerActiveOrder } from "@/features/admin/banners/server/banner-service";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReorderPayload = {
  id?: string;
  direction?: "up" | "down";
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const payload = (await request.json()) as ReorderPayload;
    const id = String(payload.id ?? "").trim();
    const direction = payload.direction;

    if (!id) {
      return NextResponse.json({ ok: false, message: "id is required." }, { status: 400 });
    }

    if (direction !== "up" && direction !== "down") {
      return NextResponse.json({ ok: false, message: "direction must be 'up' or 'down'." }, { status: 400 });
    }

    await moveBannerActiveOrder(id, direction);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reorder banner.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

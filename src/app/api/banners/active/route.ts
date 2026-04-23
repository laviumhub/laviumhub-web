import { NextResponse } from "next/server";

import { getActiveBanner } from "@/features/admin/banners/server/banner-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banner = await getActiveBanner();
    return NextResponse.json({ ok: true, data: banner }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch active banner.";
    return NextResponse.json({ ok: false, message, data: null }, { status: 500 });
  }
}

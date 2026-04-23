import { NextResponse } from "next/server";

import { getActiveBanners } from "@/features/admin/banners/server/banner-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await getActiveBanners();
    return NextResponse.json({ ok: true, data: banners }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch active banners.";
    return NextResponse.json({ ok: false, message, data: [] }, { status: 500 });
  }
}

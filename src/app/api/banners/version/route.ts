import { NextResponse } from "next/server";

import { getBannerCacheVersion } from "@/features/admin/banners/server/banner-cache-version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      version: getBannerCacheVersion(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

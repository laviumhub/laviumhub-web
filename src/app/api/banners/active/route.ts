import { NextResponse } from "next/server";

import {
  ensureBannerFingerprintInitialized,
  getBannerCacheVersion,
} from "@/features/admin/banners/server/banner-cache-version";
import { getActiveBanners } from "@/features/admin/banners/server/banner-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL_HEADER = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
const FORCE_REFRESH_CACHE_CONTROL_HEADER = "no-store, max-age=0";

function resolveForceRefresh(request: Request): { requested: boolean; allowed: boolean } {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("refresh") === "1" || searchParams.get("force") === "1";
  if (!requested) return { requested: false, allowed: false };

  const expectedToken = process.env.BANNERS_REFRESH_TOKEN;
  if (!expectedToken) return { requested: true, allowed: true };

  const providedToken = searchParams.get("token") ?? "";
  return { requested: true, allowed: providedToken === expectedToken };
}

export async function GET(request: Request) {
  const forceRefresh = resolveForceRefresh(request);
  if (forceRefresh.requested && !forceRefresh.allowed) {
    return NextResponse.json(
      { ok: false, message: "Forbidden: invalid refresh token.", data: [] },
      {
        status: 403,
        headers: {
          "Cache-Control": FORCE_REFRESH_CACHE_CONTROL_HEADER,
        },
      }
    );
  }

  const cacheControl = forceRefresh.allowed ? FORCE_REFRESH_CACHE_CONTROL_HEADER : CACHE_CONTROL_HEADER;

  try {
    const banners = await getActiveBanners();
    ensureBannerFingerprintInitialized(banners);
    const version = getBannerCacheVersion();
    return NextResponse.json(
      { ok: true, data: banners, version },
      {
        status: 200,
        headers: {
          "Cache-Control": cacheControl,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch active banners.";
    return NextResponse.json(
      { ok: false, message, data: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": cacheControl,
        },
      }
    );
  }
}

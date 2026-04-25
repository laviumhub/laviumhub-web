import { NextResponse } from "next/server";

import {
  ensureBannerFingerprintInitialized,
  getBannerCacheVersion,
} from "@/features/admin/banners/server/banner-cache-version";
import type { Banner } from "@/features/admin/banners/types";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL_HEADER = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";
const FORCE_REFRESH_CACHE_CONTROL_HEADER = "no-store, max-age=0";

async function getActiveBannersForPublic(): Promise<Banner[]> {
  const supabase = getSupabaseServerClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("banners")
    .select("id,title,description,image_url,is_active,active_order,start_at,end_at,created_at,updated_at")
    .eq("is_active", true)
    .lte("start_at", nowIso)
    .or(`end_at.is.null,end_at.gte.${nowIso}`)
    .order("active_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch active banners: ${error.message}`);
  }

  return (data ?? []) as Banner[];
}

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
    const banners = await getActiveBannersForPublic();
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

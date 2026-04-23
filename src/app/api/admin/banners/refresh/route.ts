import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getActiveBanners } from "@/features/admin/banners/server/banner-service";
import { refreshBannerCacheVersionIfChanged } from "@/features/admin/banners/server/banner-cache-version";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RefreshPayload = {
  secret?: string;
};

export async function POST(request: NextRequest) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const payload = (await request.json()) as RefreshPayload;
    const providedSecret = String(payload.secret ?? "");
    const expectedSecret = process.env.BANNERS_REFRESH_TOKEN ?? "";

    if (!expectedSecret) {
      return NextResponse.json(
        { ok: false, message: "BANNERS_REFRESH_TOKEN is not configured on the server." },
        { status: 500 }
      );
    }

    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ ok: false, message: "Invalid force refresh token." }, { status: 403 });
    }

    const banners = await getActiveBanners();
    const result = refreshBannerCacheVersionIfChanged(banners);
    if (!result.changed) {
      return NextResponse.json(
        {
          ok: true,
          changed: false,
          version: result.version,
          message: "Tidak ada perubahan banner aktif. Cache version tidak diubah.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        changed: true,
        version: result.version,
        message: "Perubahan terdeteksi. Cache version diperbarui dan user akan refetch banner.",
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to force refresh banner cache.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  createBanner,
  getImageFileFromFormData,
  listAdminBanners,
  parseBannerInputFromFormData
} from "@/features/admin/banners/server/banner-service";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const banners = await listAdminBanners();
    return NextResponse.json({ ok: true, data: banners }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list banners.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const input = parseBannerInputFromFormData(formData);
    const image = getImageFileFromFormData(formData);
    const banner = await createBanner(input, image);

    return NextResponse.json({ ok: true, data: banner }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create banner.";
    const status =
      message.includes("required") || message.includes("Invalid") || message.includes("active_order") ? 400 : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

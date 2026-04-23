import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  deleteBanner,
  getImageFileFromFormData,
  updateBanner,
  parseBannerInputFromFormData
} from "@/features/admin/banners/server/banner-service";
import { requireAdminApiSession } from "@/lib/auth/require-admin-api-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BannerRouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: NextRequest, { params }: BannerRouteParams) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const formData = await request.formData();
    const input = parseBannerInputFromFormData(formData);
    const image = getImageFileFromFormData(formData);
    const banner = await updateBanner(id, input, image);

    return NextResponse.json({ ok: true, data: banner }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update banner.";
    const status =
      message.includes("not found")
        ? 404
        : message.includes("required") || message.includes("Invalid") || message.includes("active_order")
          ? 400
          : 500;
    return NextResponse.json({ ok: false, message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: BannerRouteParams) {
  const auth = await requireAdminApiSession(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    await deleteBanner(id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete banner.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/auth/admin-session";

export async function requireAdminApiSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSession(token);

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    ok: true as const,
    session
  };
}

import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  signAdminSession
} from "@/lib/auth/admin-session";
import { verifyPassword } from "@/lib/auth/password-hash";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginRequestBody = {
  username?: string;
  password?: string;
};

type LoginResponse = {
  ok: boolean;
  message: string;
  user?: {
    uid: string;
    username: string;
    name: string;
  };
};

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  if (!process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      { ok: false, message: "Server auth config is missing (ADMIN_SESSION_SECRET)." } satisfies LoginResponse,
      { status: 500 }
    );
  }

  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid login request payload." } satisfies LoginResponse,
      { status: 400 }
    );
  }

  try {
    const username = normalizeUsername(body.username ?? "");
    const password = String(body.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, message: "Username and password are required." } satisfies LoginResponse,
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .select("uid, username, name, password")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Supabase login query failed", error);
      return NextResponse.json(
        { ok: false, message: "Login service is temporarily unavailable." } satisfies LoginResponse,
        { status: 503 }
      );
    }

    const passwordHash = data ? String(data.password) : "";
    const isPasswordValid = data ? await verifyPassword(password, passwordHash) : false;

    if (!data || !isPasswordValid) {
      return NextResponse.json(
        { ok: false, message: "Invalid username or password." } satisfies LoginResponse,
        { status: 401 }
      );
    }

    const token = await signAdminSession({
      uid: String(data.uid),
      username: String(data.username),
      name: String(data.name)
    });

    const response = NextResponse.json(
      {
        ok: true,
        message: "Login successful.",
        user: {
          uid: String(data.uid),
          username: String(data.username),
          name: String(data.name)
        }
      } satisfies LoginResponse,
      { status: 200 }
    );

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_SESSION_TTL_SECONDS
    });

    return response;
  } catch (error) {
    console.error("Login route error", error);
    return NextResponse.json(
      { ok: false, message: "Login request failed." } satisfies LoginResponse,
      { status: 500 }
    );
  }
}

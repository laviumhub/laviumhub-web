import { createClient } from "npm:@supabase/supabase-js@2";

type RawMachineRecord = {
  machine_name: string;
  device_id: string;
  status: string;
  state: string;
};

const LOGIN_URL = "https://jagolink.id/login";
const LOGIN_ACTION_URL = "https://jagolink.id/login_act";
const TARGET_URL = "https://jagolink.id/others/iot-machine";
const USER_AGENT = "Mozilla/5.0 (compatible; LaviumHubSupabaseScraper/1.0)";
const DEFAULT_TIMEZONE = "Asia/Jakarta";
const TEN_MINUTES_MS = 10 * 60 * 1000;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractCsrfToken(html: string): string | null {
  const tokenMatch = html.match(/name=["']_token["'][^>]*value=["']([^"']+)["']/i);
  return tokenMatch?.[1] ?? null;
}

function getSetCookieHeaders(headers: Headers): string[] {
  const raw = headers.get("set-cookie");
  if (!raw) return [];
  return raw.split(/,(?=\s*[^;,\s]+=)/g).map((entry) => entry.trim());
}

function mergeCookieJar(cookieJar: Map<string, string>, setCookies: string[]): void {
  for (const cookie of setCookies) {
    const cookiePair = cookie.split(";", 1)[0];
    if (!cookiePair) continue;

    const separatorIndex = cookiePair.indexOf("=");
    if (separatorIndex <= 0) continue;

    const name = cookiePair.slice(0, separatorIndex).trim();
    const value = cookiePair.slice(separatorIndex + 1).trim();
    if (!name || !value) continue;

    cookieJar.set(name, value);
  }
}

function cookieHeader(cookieJar: Map<string, string>): string {
  return Array.from(cookieJar.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

function resolveRedirectUrl(location: string, baseUrl: string): string {
  return new URL(location, baseUrl).toString();
}

async function fetchWithCookies(
  input: string,
  init: RequestInit,
  cookieJar: Map<string, string>,
  maxRedirects = 5,
): Promise<Response> {
  let url = input;
  let method = init.method ?? "GET";
  let body = init.body;

  for (let index = 0; index <= maxRedirects; index += 1) {
    const headers = new Headers(init.headers);
    const cookie = cookieHeader(cookieJar);
    if (cookie) headers.set("cookie", cookie);

    const response = await fetch(url, {
      ...init,
      method,
      body,
      headers,
      redirect: "manual",
      cache: "no-store",
    });

    mergeCookieJar(cookieJar, getSetCookieHeaders(response.headers));

    const redirectLocation = response.headers.get("location");
    const isRedirect = response.status >= 300 && response.status < 400 && redirectLocation;
    if (!isRedirect) return response;

    url = resolveRedirectUrl(redirectLocation, url);
    if (response.status === 303 || ((response.status === 301 || response.status === 302) && method === "POST")) {
      method = "GET";
      body = undefined;
    }
  }

  throw new Error("Too many redirects while scraping");
}

function isLikelyLoginPage(html: string): boolean {
  return /login_act/i.test(html) && /name=["']username["']/i.test(html);
}

function parseMachinesFromHtml(html: string): RawMachineRecord[] {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  const machines: RawMachineRecord[] = [];

  for (const row of rows) {
    const tds = row.match(/<td[\s\S]*?<\/td>/gi);
    if (!tds || tds.length < 2) continue;

    const infoHtml = tds[0];
    const infoText = stripTags(infoHtml);

    const nameMatch = infoText.match(/(Mesin Cuci No|Pengering)\s+\d+/i);
    if (!nameMatch) continue;

    const deviceIdMatch = infoText.match(/(WML|DM)_[A-Z0-9]+/i);
    const stateMatch = infoHtml.match(/badge-(danger|success)[^>]*>([^<]+)/i);

    machines.push({
      machine_name: nameMatch[0],
      device_id: deviceIdMatch?.[0] ?? "",
      status: /online/i.test(infoText) ? "Online" : "Offline",
      state: stateMatch?.[2]?.trim() ?? "",
    });
  }

  return machines;
}

function getJakartaDayAndHour(now: Date): { day: string; hour: number } {
  const day = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: DEFAULT_TIMEZONE,
  }).format(now);

  const hourText = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    timeZone: DEFAULT_TIMEZONE,
  }).format(now);
  const hour = Number.parseInt(hourText, 10);
  return {
    day,
    hour: Number.isFinite(hour) ? hour : now.getUTCHours(),
  };
}

function getMinRefreshIntervalMsByDay(now: Date): number {
  const { day } = getJakartaDayAndHour(now);
  const isFriSatSun = day === "Fri" || day === "Sat" || day === "Sun";
  return isFriSatSun ? TEN_MINUTES_MS : THIRTY_MINUTES_MS;
}

function isWithinLaviumSchedule(now: Date): boolean {
  const { day, hour } = getJakartaDayAndHour(now);
  if (day === "Mon") return hour >= 14 && hour < 23;
  if (day === "Tue" || day === "Wed" || day === "Thu") return hour >= 6 && hour < 23;
  if (day === "Fri" || day === "Sat" || day === "Sun") return hour >= 6 && hour < 23;
  return false;
}

async function scrapeJagolinkMachineStatus(username: string, password: string): Promise<{
  machines: RawMachineRecord[];
  timestampIso: string;
}> {
  const jar = new Map<string, string>();

  const loginPageResponse = await fetchWithCookies(
    LOGIN_URL,
    {
      method: "GET",
      headers: {
        "user-agent": USER_AGENT,
      },
    },
    jar,
  );

  if (!loginPageResponse.ok) {
    throw new Error(`Failed to load login page (${loginPageResponse.status})`);
  }

  const loginPage = await loginPageResponse.text();
  const token = extractCsrfToken(loginPage);
  if (!token) {
    throw new Error("Failed to retrieve CSRF token");
  }

  const loginPayload = new URLSearchParams({
    _token: token,
    username,
    password,
  });

  const loginResponse = await fetchWithCookies(
    LOGIN_ACTION_URL,
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": USER_AGENT,
      },
      body: loginPayload.toString(),
    },
    jar,
  );

  if (!loginResponse.ok) {
    throw new Error(`Login request failed (${loginResponse.status})`);
  }

  const targetResponse = await fetchWithCookies(
    TARGET_URL,
    {
      method: "GET",
      headers: {
        "user-agent": USER_AGENT,
      },
    },
    jar,
  );

  if (!targetResponse.ok) {
    throw new Error(`Failed to load machine page (${targetResponse.status})`);
  }

  const page = await targetResponse.text();
  if (isLikelyLoginPage(page)) {
    throw new Error("Login failed: redirected back to login page");
  }

  const machines = parseMachinesFromHtml(page);
  if (machines.length === 0) {
    throw new Error("No machines found: page structure changed or unauthorized");
  }

  return {
    machines,
    timestampIso: new Date().toISOString(),
  };
}

Deno.serve(async (request: Request) => {
  try {
    const expectedSecret = Deno.env.get("MACHINE_REFRESH_CRON_SECRET") ?? "";
    if (expectedSecret) {
      const headerSecret = request.headers.get("x-machine-refresh-secret") ?? "";
      if (!headerSecret || headerSecret !== expectedSecret) {
        return json({ ok: false, message: "Unauthorized cron request." }, 401);
      }
    }

    const now = new Date();
    if (!isWithinLaviumSchedule(now)) {
      return json({
        ok: true,
        refreshed: false,
        reason: "outside_window",
        message: "Skipped: outside schedule window for Asia/Jakarta.",
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const username = Deno.env.get("JAGOLINK_USERNAME");
    const password = Deno.env.get("JAGOLINK_PASSWORD");

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ ok: false, message: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." }, 500);
    }
    if (!username || !password) {
      return json({ ok: false, message: "Missing JAGOLINK_USERNAME or JAGOLINK_PASSWORD." }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: latestData, error: latestError } = await supabase
      .from("machine_status_latest")
      .select("source_timestamp")
      .order("source_timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      return json({ ok: false, message: `Failed to read latest timestamp: ${latestError.message}` }, 500);
    }

    const minRefreshIntervalMs = getMinRefreshIntervalMsByDay(now);
    if (latestData?.source_timestamp) {
      const latestMs = new Date(String(latestData.source_timestamp)).getTime();
      if (Number.isFinite(latestMs) && now.getTime() - latestMs < minRefreshIntervalMs) {
        return json({
          ok: true,
          refreshed: false,
          reason: "throttled",
          message: `Skipped: latest refresh is still within ${Math.round(minRefreshIntervalMs / 60000)} minutes.`,
        });
      }
    }

    const scrapeResult = await scrapeJagolinkMachineStatus(username, password);
    const { data: rpcData, error: rpcError } = await supabase.rpc("refresh_machine_status_snapshot", {
      p_payload: scrapeResult.machines,
      p_source_timestamp: scrapeResult.timestampIso,
    });

    if (rpcError) {
      return json({ ok: false, message: `Failed to persist snapshot: ${rpcError.message}` }, 500);
    }

    const rpcResponse = rpcData as { updated_count?: number }[] | { updated_count?: number } | null;
    const first = Array.isArray(rpcResponse) ? rpcResponse[0] : rpcResponse;

    return json({
      ok: true,
      refreshed: true,
      updatedCount: Number(first?.updated_count ?? scrapeResult.machines.length),
      sourceTimestamp: scrapeResult.timestampIso,
      message: "Machine refresh completed via Supabase Edge Function.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown function error";
    return json({ ok: false, message }, 500);
  }
});

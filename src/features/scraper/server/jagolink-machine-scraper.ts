import "server-only";

import type { RawMachineRecord } from "@/data/types/raw-machine";

const LOGIN_URL = "https://jagolink.id/login";
const LOGIN_ACTION_URL = "https://jagolink.id/login_act";
const TARGET_URL = "https://jagolink.id/others/iot-machine";
const USER_AGENT = "Mozilla/5.0 (compatible; LaviumHubNextScraper/1.0)";

export type JagolinkScrapeResult = {
  machines: RawMachineRecord[];
  timestampIso: string;
};

function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractCsrfToken(html: string): string | null {
  const tokenMatch = html.match(/name=["']_token["'][^>]*value=["']([^"']+)["']/i);
  return tokenMatch?.[1] ?? null;
}

function getSetCookieHeaders(headers: Headers): string[] {
  const rawGetSetCookie = (headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
  if (typeof rawGetSetCookie === "function") {
    return rawGetSetCookie.call(headers);
  }

  const single = headers.get("set-cookie");
  if (!single) return [];

  return single.split(/,(?=\s*[^;,\s]+=)/g).map((entry) => entry.trim());
}

function mergeCookieJar(cookieJar: Map<string, string>, setCookies: string[]) {
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
  maxRedirects = 5
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

export async function scrapeJagolinkMachineStatus(username: string, password: string): Promise<JagolinkScrapeResult> {
  const jar = new Map<string, string>();

  const loginPageResponse = await fetchWithCookies(
    LOGIN_URL,
    {
      method: "GET",
      headers: {
        "user-agent": USER_AGENT,
      },
    },
    jar
  );

  if (!loginPageResponse.ok) {
    throw new Error(`Failed to load login page (${loginPageResponse.status})`);
  }

  mergeCookieJar(jar, getSetCookieHeaders(loginPageResponse.headers));
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
    jar
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
    jar
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

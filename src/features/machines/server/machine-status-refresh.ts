import "server-only";

import { scrapeJagolinkMachineStatus } from "@/features/scraper/server/jagolink-machine-scraper";
import { getLatestMachineRefreshTimestampMs, saveMachineStatusSnapshot } from "@/features/machines/server/machine-status-store";

const MIN_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const DEFAULT_TIMEZONE = "Asia/Jakarta";
const DEFAULT_START_HOUR = 6;
const DEFAULT_END_HOUR = 23;

export type MachineStatusRefreshResult =
  | {
      refreshed: true;
      updatedCount: number;
      sourceTimestamp: string;
      message: string;
    }
  | {
      refreshed: false;
      reason: "outside_window" | "throttled";
      message: string;
      nextAllowedAt?: string;
    };

function getEnvNumber(name: string, fallback: number): number {
  const parsed = Number.parseInt(process.env[name] ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function getNowHourInTimeZone(now: Date, timeZone: string): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    timeZone,
  }).format(now);

  const hour = Number.parseInt(formatted, 10);
  return Number.isFinite(hour) ? hour : now.getUTCHours();
}

function isWithinRefreshWindow(now: Date): boolean {
  const timeZone = process.env.MACHINE_REFRESH_TIMEZONE ?? DEFAULT_TIMEZONE;
  const startHour = getEnvNumber("MACHINE_REFRESH_START_HOUR", DEFAULT_START_HOUR);
  const endHour = getEnvNumber("MACHINE_REFRESH_END_HOUR", DEFAULT_END_HOUR);
  const hour = getNowHourInTimeZone(now, timeZone);

  return hour >= startHour && hour < endHour;
}

function getRequiredScraperCredentials(): { username: string; password: string } {
  const username = process.env.JAGOLINK_USERNAME;
  const password = process.env.JAGOLINK_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing JAGOLINK_USERNAME or JAGOLINK_PASSWORD environment variables");
  }

  return { username, password };
}

export async function refreshMachineStatuses(options?: {
  force?: boolean;
  now?: Date;
}): Promise<MachineStatusRefreshResult> {
  const force = options?.force ?? false;
  const now = options?.now ?? new Date();

  if (!isWithinRefreshWindow(now)) {
    return {
      refreshed: false,
      reason: "outside_window",
      message: "Refresh di luar jam operasional (06:00 - 23:00) dilewati.",
    };
  }

  const latestRefreshMs = await getLatestMachineRefreshTimestampMs();
  if (!force && latestRefreshMs && now.getTime() - latestRefreshMs < MIN_REFRESH_INTERVAL_MS) {
    return {
      refreshed: false,
      reason: "throttled",
      message: "Refresh dilewati karena belum melewati interval 10 menit.",
      nextAllowedAt: new Date(latestRefreshMs + MIN_REFRESH_INTERVAL_MS).toISOString(),
    };
  }

  const { username, password } = getRequiredScraperCredentials();
  const scrapeResult = await scrapeJagolinkMachineStatus(username, password);
  const updatedCount = await saveMachineStatusSnapshot(scrapeResult.machines, scrapeResult.timestampIso);

  return {
    refreshed: true,
    updatedCount,
    sourceTimestamp: scrapeResult.timestampIso,
    message: `Refresh machine status berhasil (${updatedCount} row).`,
  };
}

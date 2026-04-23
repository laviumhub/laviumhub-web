import { createHash } from "node:crypto";

import type { Banner } from "@/features/admin/banners/types";

type BannerCacheVersionState = {
  version: string;
  fingerprint: string | null;
};

const state: BannerCacheVersionState = {
  version: "v1",
  fingerprint: null,
};

function toFingerprintInput(banners: Banner[]): string {
  return JSON.stringify(
    banners.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      image_url: item.image_url,
      is_active: item.is_active,
      active_order: item.active_order,
      start_at: item.start_at,
      end_at: item.end_at,
      updated_at: item.updated_at,
    }))
  );
}

function computeFingerprint(banners: Banner[]): string {
  return createHash("sha256").update(toFingerprintInput(banners)).digest("hex");
}

export function getBannerCacheVersion(): string {
  return state.version;
}

export function ensureBannerFingerprintInitialized(banners: Banner[]): void {
  if (state.fingerprint) return;
  state.fingerprint = computeFingerprint(banners);
}

export function refreshBannerCacheVersionIfChanged(banners: Banner[]): {
  changed: boolean;
  version: string;
} {
  const nextFingerprint = computeFingerprint(banners);
  if (!state.fingerprint) {
    state.fingerprint = nextFingerprint;
    return { changed: false, version: state.version };
  }

  if (nextFingerprint === state.fingerprint) {
    return { changed: false, version: state.version };
  }

  state.fingerprint = nextFingerprint;
  state.version = `v${Date.now()}`;
  return { changed: true, version: state.version };
}

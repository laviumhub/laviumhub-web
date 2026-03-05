import type { DeliveryDecision, DeliveryRuleTier } from "./types";

export function findMatchedDeliveryRule(
  distanceKm: number | null,
  rules: DeliveryRuleTier[]
): DeliveryRuleTier | null {
  if (distanceKm === null) return null;

  const meters = distanceKm * 1000;
  return rules.find((rule) => meters <= rule.maxMeters) ?? null;
}

export function distanceKmToMeters(distanceKm: number | null): number | null {
  if (distanceKm === null) return null;
  return Math.round(distanceKm * 1000);
}

export function formatCurrencyIdr(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

export function evaluateDeliveryDecision(params: {
  engineEnabled: boolean;
  businessActive: boolean;
  distanceKm: number | null;
  rules: DeliveryRuleTier[];
}): DeliveryDecision {
  const { engineEnabled, businessActive, distanceKm, rules } = params;

  if (!engineEnabled) {
    return {
      eligible: false,
      matchedRule: null,
      price: null,
      distanceMeters: null,
      reasonCode: "engine_disabled",
    };
  }

  if (!businessActive) {
    return {
      eligible: false,
      matchedRule: null,
      price: null,
      distanceMeters: null,
      reasonCode: "business_inactive",
    };
  }

  const distanceMeters = distanceKmToMeters(distanceKm);
  if (distanceMeters === null) {
    return {
      eligible: false,
      matchedRule: null,
      price: null,
      distanceMeters: null,
      reasonCode: "distance_unavailable",
    };
  }

  const matchedRule = findMatchedDeliveryRule(distanceKm, rules);
  if (!matchedRule) {
    return {
      eligible: false,
      matchedRule: null,
      price: null,
      distanceMeters,
      reasonCode: "out_of_coverage",
    };
  }

  return {
    eligible: true,
    matchedRule,
    price: matchedRule.price,
    distanceMeters,
    reasonCode: "matched_rule",
  };
}

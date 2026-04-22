import type { LatLng } from "@/lib/geo";

export type DeliveryRuleTier = {
  id: string;
  label: string;
  maxMeters: number;
  price: number;
  active: boolean;
};

export type DeliveryEngineConfig = {
  features: {
    deliveryRuleEngine: boolean;
    routeMode: boolean;
  };
  settings?: {
    pricingDistanceMode?: "straight" | "route";
  };
  business: {
    id: string;
    name: string;
    active: boolean;
    destination: LatLng;
  };
  rules: DeliveryRuleTier[];
};

export type DeliveryDecision = {
  eligible: boolean;
  matchedRule: DeliveryRuleTier | null;
  price: number | null;
  distanceMeters: number | null;
  reasonCode:
    | "engine_disabled"
    | "business_inactive"
    | "distance_unavailable"
    | "matched_rule"
    | "out_of_coverage";
};

export type RouteState = {
  distanceKm: number;
  durationMin: number;
  path: LatLng[];
};

export type OsrmResponse = {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: {
      coordinates: [number, number][];
    };
  }>;
};

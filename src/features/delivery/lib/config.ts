import rawDeliveryEngineConfig from "@/data/content/delivery-engine.json";
import type { DeliveryEngineConfig } from "./types";

export function getDeliveryEngineConfig(): DeliveryEngineConfig {
  return rawDeliveryEngineConfig as DeliveryEngineConfig;
}

export function getActiveRules(config: DeliveryEngineConfig) {
  return [...config.rules].filter((rule) => rule.active).sort((a, b) => a.maxMeters - b.maxMeters);
}

export function getBusinessDestination(config: DeliveryEngineConfig) {
  const engineEnabled = config.features.deliveryRuleEngine;
  const businessActive = config.business.active;
  return engineEnabled && businessActive ? config.business.destination : null;
}

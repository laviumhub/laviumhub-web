import type { LatLng } from "@/lib/geo";
import type { OsrmResponse, RouteState } from "./types";

export function buildOsrmRouteUrl(
  origin: LatLng,
  destination: LatLng,
  options?: {
    allowUTurn?: boolean;
    via?: LatLng[];
  }
): string {
  const coords = [origin, ...(options?.via ?? []), destination];
  const coordinates = coords.map((point) => `${point.lng},${point.lat}`).join(";");
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    continue_straight: options?.allowUTurn ? "false" : "true",
  });

  return (
    `https://router.project-osrm.org/route/v1/driving/` +
    `${coordinates}` +
    `?${params.toString()}`
  );
}

export function parseOsrmRoute(data: OsrmResponse): RouteState {
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("Route not available");
  }

  const validRoutes = data.routes.filter((route) => {
    const coordinates = route.geometry?.coordinates;
    return Array.isArray(coordinates) && coordinates.length >= 2;
  });
  if (!validRoutes.length) throw new Error("Route geometry not available");

  const route = validRoutes[0];
  if (!route) throw new Error("Route geometry not available");
  const coords = route.geometry?.coordinates;
  if (!coords) throw new Error("Route geometry not available");

  return {
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
    path: coords.map(([lng, lat]) => ({ lat, lng })),
  };
}

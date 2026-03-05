import "leaflet/dist/leaflet.css";
import type { LatLng } from "../lib/geo";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import styles from "./DistanceMap.module.css";

function buildPinSvg(color: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
      <path d="M15 1C7.82 1 2 6.82 2 14c0 8.48 10.66 20.94 12.23 22.73a1 1 0 0 0 1.54 0C17.34 34.94 28 22.48 28 14 28 6.82 22.18 1 15 1z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="15" cy="14" r="5.5" fill="#ffffff" />
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const OriginIcon = L.icon({
  iconUrl: buildPinSvg("#16a34a"),
  iconRetinaUrl: buildPinSvg("#16a34a"),
  iconSize: [30, 42] as [number, number],
  iconAnchor: [15, 42] as [number, number],
  popupAnchor: [0, -36] as [number, number],
});

const DestinationIcon = L.icon({
  iconUrl: buildPinSvg("#dc2626"),
  iconRetinaUrl: buildPinSvg("#dc2626"),
  iconSize: [30, 42] as [number, number],
  iconAnchor: [15, 42] as [number, number],
  popupAnchor: [0, -36] as [number, number],
});

function FitMapView({
  origin,
  destination,
  routePath,
}: {
  origin: LatLng;
  destination: LatLng | null;
  routePath: LatLng[] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!destination) {
      map.setView([origin.lat, origin.lng], 14);
      return;
    }

    const points = routePath && routePath.length >= 2 ? routePath : [origin, destination];
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.12));
  }, [map, origin, destination, routePath]);

  return null;
}

export default function DistanceMap({
  origin,
  destination,
  mode,
  routePath,
  originPopupLabel,
  destinationPopupLabel,
}: {
  origin: LatLng;
  destination: LatLng | null;
  mode: "straight" | "route";
  routePath: LatLng[] | null;
  originPopupLabel: string;
  destinationPopupLabel: string;
}) {
  const center = destination ?? origin;
  const polylinePositions =
    destination === null
      ? null
      : mode === "route" && routePath && routePath.length >= 2
        ? routePath.map((point) => [point.lat, point.lng] as [number, number])
        : ([
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ] as [number, number][]);

  return (
    <div className={styles.wrap}>
      <MapContainer center={[center.lat, center.lng]} zoom={14} className={styles.map}>
        <FitMapView origin={origin} destination={destination} routePath={routePath} />
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[origin.lat, origin.lng]} icon={OriginIcon}>
          <Popup>{originPopupLabel}</Popup>
        </Marker>

        {destination && (
          <>
            <Marker position={[destination.lat, destination.lng]} icon={DestinationIcon}>
              <Popup>{destinationPopupLabel}</Popup>
            </Marker>
            {polylinePositions && <Polyline positions={polylinePositions} />}
          </>
        )}
      </MapContainer>
    </div>
  );
}

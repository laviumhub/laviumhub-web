import "leaflet/dist/leaflet.css";
import type { LatLng } from "../lib/geo";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useEffect, useRef } from "react";
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
  suspendAutoFit,
}: {
  origin: LatLng;
  destination: LatLng | null;
  routePath: LatLng[] | null;
  suspendAutoFit: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (suspendAutoFit) return;

    if (!destination) {
      map.setView([origin.lat, origin.lng], 14);
      return;
    }

    const points = routePath && routePath.length >= 2 ? routePath : [origin, destination];
    const bounds = L.latLngBounds(points.map((point) => [point.lat, point.lng] as [number, number]));
    map.fitBounds(bounds.pad(0.12));
  }, [map, origin, destination, routePath, suspendAutoFit]);

  useEffect(() => {
    if (!suspendAutoFit) return;
    map.setView([origin.lat, origin.lng], Math.max(map.getZoom(), 14));
  }, [map, origin, suspendAutoFit]);

  return null;
}

function MapPickEvents({
  enabled,
  onPickOrigin,
}: {
  enabled: boolean;
  onPickOrigin?: (point: LatLng) => void;
}) {
  const longPressTimer = useRef<number | null>(null);
  const map = useMapEvents({
    dblclick(event) {
      if (!enabled || !onPickOrigin) return;
      onPickOrigin({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
    touchstart(event) {
      if (!enabled || !onPickOrigin) return;
      if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
      const { lat, lng } = event.latlng;
      longPressTimer.current = window.setTimeout(() => {
        onPickOrigin({ lat, lng });
        longPressTimer.current = null;
      }, 550);
    },
    touchend() {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    },
    touchmove() {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    },
    movestart() {
      if (longPressTimer.current !== null) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    },
  });

  useEffect(() => {
    return () => {
      if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
    };
  }, []);

  return null;
}

function EnsureMapInteractions({ allowPickOrigin }: { allowPickOrigin: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    if (allowPickOrigin) {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
  }, [map, allowPickOrigin]);

  return null;
}

function FitAfterPick({
  token,
  origin,
  destination,
}: {
  token: number;
  origin: LatLng;
  destination: LatLng | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (token <= 0) return;
    if (!destination) {
      map.setView([origin.lat, origin.lng], 13);
      return;
    }
    const bounds = L.latLngBounds([
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ]);
    map.fitBounds(bounds.pad(0.16));
  }, [map, token, origin, destination]);

  return null;
}

export default function DistanceMap({
  origin,
  destination,
  mode,
  routePath,
  originPopupLabel,
  destinationPopupLabel,
  allowPickOrigin = false,
  onPickOrigin,
  fitAfterPickToken = 0,
}: {
  origin: LatLng;
  destination: LatLng | null;
  mode: "straight" | "route";
  routePath: LatLng[] | null;
  originPopupLabel: string;
  destinationPopupLabel: string;
  allowPickOrigin?: boolean;
  onPickOrigin?: (point: LatLng) => void;
  fitAfterPickToken?: number;
}) {
  const center = allowPickOrigin ? origin : destination ?? origin;
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
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        className={styles.map}
        dragging
        scrollWheelZoom
        doubleClickZoom
        touchZoom
        boxZoom
        keyboard
      >
        <EnsureMapInteractions allowPickOrigin={allowPickOrigin} />
        <FitMapView
          origin={origin}
          destination={destination}
          routePath={routePath}
          suspendAutoFit={allowPickOrigin}
        />
        <FitAfterPick token={fitAfterPickToken} origin={origin} destination={destination} />
        <MapPickEvents enabled={allowPickOrigin} onPickOrigin={onPickOrigin} />
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

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Group,
  Paper,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconInfoCircle, IconMapPin, IconNavigation } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import DistanceMap from "./components/DistanceMap";
import {
  getActiveRules,
  getBusinessDestination,
  getDeliveryEngineConfig,
} from "./lib/delivery-engine/config";
import {
  distanceKmToMeters,
  evaluateDeliveryDecision,
  findMatchedDeliveryRule,
  formatCurrencyIdr,
} from "./lib/delivery-engine/evaluate";
import { buildOsrmRouteUrl, parseOsrmRoute } from "./lib/delivery-engine/routing";
import type { DeliveryEngineConfig, OsrmResponse, RouteState } from "./lib/delivery-engine/types";
import type { LatLng } from "./lib/geo";
import { haversineKm } from "./lib/geo";

const DEFAULT_ORIGIN: LatLng = { lat: -6.1843334, lng: 106.8398113 };
const KRAMAT_RAYA_WAYPOINT: LatLng = { lat: -6.1782, lng: 106.8423 };
const LAVIUMHUB_WHATSAPP = "6285117674118";

type Language = "id" | "en";

type Messages = {
  title: string;
  subtitle: string;
  origin: string;
  originCoordinates: string;
  destination: string;
  destinationInput: string;
  requestLocation: string;
  refreshLocation: string;
  geoUnsupported: string;
  geoDenied: string;
  minuteUnit: string;
  routeNotReady: string;
  engineTitle: string;
  available: string;
  unavailable: string;
  engineDisabled: string;
  businessInactive: string;
  businessLabel: string;
  pricingDistance: string;
  tierMatch: string;
  pickupDeliveryFee: string;
  expressInfo: string;
  outOfCoverage: string;
  mapYourLocation: string;
  orderNow: string;
  pickFromMap: string;
  pickFromMapHint: string;
  pickFromMapLoading: string;
};

const MESSAGES: Record<Language, Messages> = {
  id: {
    title: "Antar Jemput Laundry",
    subtitle: "Cek cakupan dan estimasi biaya antar-jemput berdasarkan jarak.",
    origin: "Lokasi Anda",
    originCoordinates: "Koordinat asal",
    destination: "Lokasi Bisnis",
    destinationInput: "Koordinat tujuan",
    requestLocation: "Gunakan Lokasi Saat Ini",
    refreshLocation: "Perbarui Lokasi",
    geoUnsupported: "Browser tidak mendukung geolokasi.",
    geoDenied: "Izin lokasi ditolak.",
    minuteUnit: "menit",
    routeNotReady: "Rute belum tersedia.",
    engineTitle: "Dasar Perhitungan",
    available: "Tersedia",
    unavailable: "Tidak tersedia",
    engineDisabled: "Engine delivery sedang dinonaktifkan.",
    businessInactive: "Bisnis sedang tidak aktif.",
    businessLabel: "Usaha",
    pricingDistance: "Jarak",
    tierMatch: "Paket",
    pickupDeliveryFee: "Biaya antar-jemput",
    expressInfo: "Butuh express? Konsultasikan aja. Layanan express tersedia dengan penambahan biaya.",
    outOfCoverage: "Jarak di luar cakupan tier aktif.",
    mapYourLocation: "Lokasi Anda",
    orderNow: "Pesan Sekarang",
    pickFromMap: "Pilih dari peta",
    pickFromMapHint: "Saat aktif: desktop double click, mobile long press untuk ganti titik. Peta tetap bisa digeser/zoom.",
    pickFromMapLoading: "Memperbarui titik lokasi...",
  },
  en: {
    title: "Laundry Pickup & Delivery",
    subtitle: "Check delivery coverage and estimated fee based on distance.",
    origin: "Your Location",
    originCoordinates: "Origin coordinates",
    destination: "Business Destination",
    destinationInput: "Destination coordinates",
    requestLocation: "Use Current Location",
    refreshLocation: "Refresh Location",
    geoUnsupported: "This browser does not support geolocation.",
    geoDenied: "Location permission denied.",
    minuteUnit: "min",
    routeNotReady: "Route is not available yet.",
    engineTitle: "Calculation Basis",
    available: "Available",
    unavailable: "Unavailable",
    engineDisabled: "Delivery engine is disabled.",
    businessInactive: "Business is currently inactive.",
    businessLabel: "Business",
    pricingDistance: "Pricing distance",
    tierMatch: "Matched tier",
    pickupDeliveryFee: "Pickup & delivery fee",
    expressInfo: "Need express service? Just consult us. Express service is available with additional charge.",
    outOfCoverage: "Distance is outside active tiers.",
    mapYourLocation: "Your location",
    orderNow: "Order Now",
    pickFromMap: "Pick from map",
    pickFromMapHint: "When enabled: double click on desktop, long press on mobile to set point. Map stays draggable/zoomable.",
    pickFromMapLoading: "Updating location point...",
  },
};

export default function Delivery() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const config = useMemo<DeliveryEngineConfig>(() => getDeliveryEngineConfig(), []);
  const engineEnabled = config.features.deliveryRuleEngine;
  const routeModeEnabled = config.features.routeMode;
  const configuredPricingMode = config.settings?.pricingDistanceMode ?? "straight";
  const businessActive = config.business.active;
  const destination = useMemo(() => getBusinessDestination(config), [config]);
  const activeRules = useMemo(() => getActiveRules(config), [config]);
  const pricingMode = configuredPricingMode === "route" && routeModeEnabled ? "route" : "straight";

  const [origin, setOrigin] = useState<LatLng>(DEFAULT_ORIGIN);
  const [hasGeo, setHasGeo] = useState(false);
  const [language, setLanguage] = useState<Language>("id");
  const [routeState, setRouteState] = useState<RouteState | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [pickFromMap, setPickFromMap] = useState(false);
  const [mapCandidateOrigin, setMapCandidateOrigin] = useState<LatLng | null>(null);
  const [isMapPickLoading, setIsMapPickLoading] = useState(false);
  const [fitAfterPickToken, setFitAfterPickToken] = useState(0);

  const t = MESSAGES[language];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleMapPickCandidate = useCallback((next: LatLng) => {
    setMapCandidateOrigin(next);
  }, []);

  useEffect(() => {
    if (!pickFromMap || !mapCandidateOrigin) {
      setIsMapPickLoading(false);
      return;
    }

    setIsMapPickLoading(true);
    const timer = window.setTimeout(() => {
      setOrigin((prev) => {
        const movedKm = haversineKm(prev, mapCandidateOrigin);
        if (movedKm < 0.005) return prev;
        setFitAfterPickToken((prevToken) => prevToken + 1);
        return mapCandidateOrigin;
      });
      setIsMapPickLoading(false);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [pickFromMap, mapCandidateOrigin]);

  const straightDistanceKm = useMemo(() => {
    if (!destination) return null;
    return haversineKm(origin, destination);
  }, [origin, destination]);

  useEffect(() => {
    if (!routeModeEnabled || pricingMode !== "route") return;
    if (!destination) {
      setRouteState(null);
      return;
    }

    const controller = new AbortController();
    const url = buildOsrmRouteUrl(origin, destination, {
      allowUTurn: true,
      via: [KRAMAT_RAYA_WAYPOINT],
    });

    async function loadRoute() {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Routing request failed (${res.status})`);

        const data = (await res.json()) as OsrmResponse;
        setRouteError(null);
        setRouteState(parseOsrmRoute(data));
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setRouteError(t.routeNotReady);
        setRouteState(null);
      }
    }

    void loadRoute();
    return () => controller.abort();
  }, [routeModeEnabled, pricingMode, origin, destination, t.routeNotReady]);

  function requestLocation() {
    if (!navigator.geolocation) {
      setGeoError(t.geoUnsupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setHasGeo(true);
        setGeoError(null);
      },
      () => {
        setGeoError(t.geoDenied);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }

  function handleOrderNow() {
    const distanceText = pricingDistanceMeters ?? "-";
    const priceText = matchedRule ? formatCurrencyIdr(matchedRule.price) : "-";
    const originMapsLink = `https://www.google.com/maps?q=${origin.lat},${origin.lng}`;
    const message =
      language === "id"
        ? [
            "Halo LaviumHub, saya ingin pesan antar-jemput laundry.",
            "",
            "Nama: ...",
            "Alamat: ...",
            `Lokasi saya: ${originMapsLink}`,
            `Perkiraan jarak: ${distanceText} m`,
            `Estimasi biaya: ${priceText}`,
            "",
            "Apakah bisa dijemput sekarang?"
          ].join("\n")
        : [
            "Hello LaviumHub, I want to book pickup & delivery service.",
            "",
            "Name: ...",
            "Address: ...",
            `My location: ${originMapsLink}`,
            `Estimated distance: ${distanceText} m`,
            `Estimated price: ${priceText}`,
            "",
            "Can it be picked up now?"
          ].join("\n");

    const waUrl = `https://wa.me/${LAVIUMHUB_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  const routeDistanceKm = routeState?.distanceKm ?? null;
  const pricingDistanceKm = pricingMode === "route" ? routeDistanceKm : straightDistanceKm;
  const pricingDistanceMeters = distanceKmToMeters(pricingDistanceKm);
  const originText = `${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}`;
  const nowText = now.toLocaleString(language === "id" ? "id-ID" : "en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  const destinationText = destination
    ? `${config.business.name}`
    : "-";

  const matchedRule = useMemo(() => {
    if (!engineEnabled || !destination) return null;
    return findMatchedDeliveryRule(pricingDistanceKm, activeRules);
  }, [engineEnabled, destination, pricingDistanceKm, activeRules]);

  const decision = useMemo(
    () =>
      evaluateDeliveryDecision({
        engineEnabled,
        businessActive,
        distanceKm: pricingDistanceKm,
        rules: activeRules,
      }),
    [engineEnabled, businessActive, pricingDistanceKm, activeRules]
  );

  return (
    <Stack gap={isMobile ? "md" : "xs"}>
      <style>{`
        @keyframes ctaPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 8px 18px rgba(185, 28, 28, 0.25);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 14px 24px rgba(185, 28, 28, 0.35);
          }
        }
      `}</style>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Title order={3}>{t.title}</Title>
        <SegmentedControl
          value={language}
          onChange={(value) => setLanguage(value as Language)}
          data={[
            { label: isMobile ? "ID" : "Indonesia", value: "id" },
            { label: isMobile ? "EN" : "English", value: "en" },
          ]}
          ml="auto"
          size={isMobile ? "xs" : "sm"}
        />
      </Group>

      <Text c="dimmed" size="sm">
        {t.subtitle}
      </Text>

      <Card withBorder radius="md" p={isMobile ? "md" : "sm"}>
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing={isMobile ? "md" : "sm"}>
          <Paper withBorder p={isMobile ? "sm" : "xs"}>
            <Group align="flex-start" wrap="nowrap" gap="sm">
              <Stack align="center" gap={0} mt={18}>
                <Box w={10} h={10} style={{ borderRadius: 999, backgroundColor: "#16a34a" }} />
                <Box w={2} h={74} style={{ backgroundColor: "rgba(17,24,39,0.2)" }} />
                <Box w={10} h={10} style={{ borderRadius: 999, backgroundColor: "#dc2626" }} />
              </Stack>

              <Stack gap="xs" style={{ flex: 1 }}>
                <Paper withBorder p="xs">
                  <Stack gap={6}>
                    <Text fw={600} size="sm">
                      {t.origin}
                    </Text>
                    <Group grow>
                      <TextInput
                        value={originText}
                        readOnly
                        leftSection={<IconNavigation size={16} />}
                        aria-label={t.originCoordinates}
                      />
                      <Button onClick={requestLocation} variant="light">
                        {hasGeo ? t.refreshLocation : t.requestLocation}
                      </Button>
                    </Group>
                    {geoError ? (
                      <Text size="xs" c="red">
                        {geoError}
                      </Text>
                    ) : null}
                    <Checkbox
                      checked={pickFromMap}
                      onChange={(event) => setPickFromMap(event.currentTarget.checked)}
                      label={t.pickFromMap}
                      size="sm"
                    />
                    {pickFromMap ? (
                      <>
                        <Text size="xs" c="dimmed">
                          {t.pickFromMapHint}
                        </Text>
                        {isMapPickLoading ? (
                          <Stack gap={4}>
                            <Text size="xs" c="dimmed">
                              {t.pickFromMapLoading}
                            </Text>
                            <Progress value={100} animated size={4} radius="xl" />
                          </Stack>
                        ) : null}
                      </>
                    ) : null}
                  </Stack>
                </Paper>

                <Paper withBorder p="xs">
                  <Stack gap={6}>
                    <Text fw={600} size="sm">
                      {t.destination}
                    </Text>
                    <TextInput
                      value={destinationText}
                      readOnly
                      leftSection={<IconMapPin size={16} />}
                      aria-label={t.destinationInput}
                    />
                  </Stack>
                </Paper>
              </Stack>
            </Group>
          </Paper>

          <Paper withBorder p={isMobile ? "sm" : "xs"}>
            <Stack gap={6}>
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={4}>
                  <Text fw={700} size="sm">{t.engineTitle}</Text>
                  <Badge color={decision.eligible ? "green" : "red"} variant="light" w="fit-content">
                    {decision.eligible ? t.available : t.unavailable}
                  </Badge>
                </Stack>
                <Text size="xs" ta="right" c="dimmed" fw={700}>
                  {nowText}
                </Text>
              </Group>

              {!engineEnabled ? (
                <Text c="red" size="sm">
                  {t.engineDisabled}
                </Text>
              ) : !businessActive ? (
                <Text c="red" size="sm">
                  {t.businessInactive}
                </Text>
              ) : (
                <>
                  <Text size="sm">
                    {t.businessLabel}: <b>{config.business.name}</b>
                  </Text>
                  <Text size="sm">
                    {t.pricingDistance}: {pricingDistanceMeters ?? "-"} m
                  </Text>

                  {decision.eligible && matchedRule ? (
                    <Text size="sm">
                      {t.tierMatch}: Radius <b>{matchedRule.label}</b> | {t.pickupDeliveryFee}: <b>{formatCurrencyIdr(matchedRule.price)}</b>
                    </Text>
                  ) : decision.reasonCode === "out_of_coverage" ? (
                    <Text c="red" size="sm">
                      {t.outOfCoverage}
                    </Text>
                  ) : null}
                  {routeError ? (
                    <Text c="red" size="sm">
                      {routeError}
                    </Text>
                  ) : null}
                  <Alert
                    variant="light"
                    color="blue"
                    icon={<IconInfoCircle size={16} />}
                    py={6}
                    px="sm"
                  >
                    <Text size="xs">{t.expressInfo}</Text>
                  </Alert>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                    {activeRules.map((rule) => (
                      <Paper
                        key={rule.id}
                        withBorder
                        p="xs"
                        bg={matchedRule?.id === rule.id ? "green.0" : undefined}
                        style={{ borderColor: matchedRule?.id === rule.id ? "#86efac" : undefined }}
                      >
                        <Group justify="space-between" gap="xs">
                          <Text size="sm">{rule.label}</Text>
                          <Text size="sm" fw={600}>
                            {formatCurrencyIdr(rule.price)}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                  </SimpleGrid>
                  <Button
                    onClick={handleOrderNow}
                    fullWidth
                    mt="xs"
                    size={isMobile ? "md" : "lg"}
                    radius="xl"
                    style={{
                      animation: "ctaPulse 1.15s ease-in-out infinite",
                      fontWeight: 800,
                      letterSpacing: 0.3,
                    }}
                  >
                    {t.orderNow}
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
        </SimpleGrid>
      </Card>

      <DistanceMap
        origin={origin}
        destination={destination}
        mode={pricingMode}
        routePath={routeState?.path ?? null}
        originPopupLabel={t.mapYourLocation}
        destinationPopupLabel={config.business.name}
        allowPickOrigin={pickFromMap}
        onPickOrigin={handleMapPickCandidate}
        fitAfterPickToken={fitAfterPickToken}
      />
    </Stack>
  );
}

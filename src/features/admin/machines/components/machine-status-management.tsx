"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

import DEFAULT_MACHINES from "@/data/json/default-machines.json";
import type { RawMachineRecord } from "@/data/types/raw-machine";

type MachineStatusRow = {
  device_id: string;
  machine_name: string;
  status: string;
  state: string;
  source_timestamp: string;
  updated_at: string;
};

type AdminMachineStatusResponse = {
  ok: boolean;
  message?: string;
  data?: MachineStatusRow[];
  source_timestamp?: string | null;
};

type RefreshResponse = {
  ok: boolean;
  message?: string;
  refreshed?: boolean;
  updatedCount?: number;
  sourceTimestamp?: string;
};

function statusColor(state: string): string {
  return state === "MATI" ? "green" : "red";
}

export function MachineStatusManagement() {
  const machineFetchIntervalMinutes = 5;
  const [rows, setRows] = useState<MachineStatusRow[]>([]);
  const [sourceTimestamp, setSourceTimestamp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshModalOpen, setRefreshModalOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState("");
  const [refreshResult, setRefreshResult] = useState<{ ok: boolean; message: string } | null>(null);

  const mergedRows = useMemo(() => {
    const map = new Map(rows.map((item) => [item.device_id, item] as const));
    return (DEFAULT_MACHINES as RawMachineRecord[]).map((item) => {
      const latest = map.get(item.device_id);
      return {
        device_id: item.device_id,
        machine_name: item.machine_name,
        status: latest?.status ?? item.status,
        state: latest?.state ?? item.state,
        source_timestamp: latest?.source_timestamp ?? "",
        updated_at: latest?.updated_at ?? "",
      } satisfies MachineStatusRow;
    });
  }, [rows]);

  async function loadMachineStatus() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/admin/machines/status", { cache: "no-store" });
      const payload = (await response.json()) as AdminMachineStatusResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Failed to load machine statuses.");
      }

      setRows(Array.isArray(payload.data) ? payload.data : []);
      setSourceTimestamp(payload.source_timestamp ?? null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to load machine statuses.");
      setRows([]);
      setSourceTimestamp(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function forceRefresh() {
    setIsRefreshing(true);
    setRefreshResult(null);

    try {
      const response = await fetch("/api/admin/machines/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: refreshToken.trim(),
        }),
      });

      const payload = (await response.json()) as RefreshResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "Failed to refresh machine statuses.");
      }

      setRefreshResult({ ok: true, message: payload.message ?? "Refresh selesai." });
      await loadMachineStatus();
    } catch (error) {
      setRefreshResult({
        ok: false,
        message: error instanceof Error ? error.message : "Failed to refresh machine statuses.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadMachineStatus();
  }, []);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Title order={2}>Machine Status</Title>
        <Button
          variant="default"
          leftSection={<IconRefresh size={16} />}
          onClick={() => {
            setRefreshToken("");
            setRefreshResult(null);
            setRefreshModalOpen(true);
          }}
        >
          Force Refresh
        </Button>
      </Group>

      <Alert color="blue" variant="light" icon={<IconAlertCircle size={16} />}>
        <Stack gap={2}>
          <Text size="sm" fw={600}>
            Update cadence
          </Text>
          <Text size="sm">
            Scheduler cron (Supabase): Senin 14:00-22:30 tiap 30 menit, Selasa-Kamis 06:00-22:30 tiap 30 menit, Jumat-Minggu 06:00-22:50 tiap 10 menit.
          </Text>
          <Text size="sm">
            Fetch status di halaman publik: Senin-Kamis tiap 10 menit, Jumat-Minggu tiap {machineFetchIntervalMinutes} menit saat tab aktif.
          </Text>
        </Stack>
      </Alert>

      {errorMessage ? (
        <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">
          {errorMessage}
        </Alert>
      ) : null}

      <Card withBorder radius="md" p="md">
        <Stack gap={4}>
          <Text size="sm" fw={600}>
            Last source update
          </Text>
          <Text size="sm" c="dimmed">
            {sourceTimestamp ? new Date(sourceTimestamp).toLocaleString("id-ID") : "-"}
          </Text>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="md">
        {isLoading ? (
          <Group>
            <Loader size="sm" />
            <Text c="dimmed">Loading machine status...</Text>
          </Group>
        ) : (
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Machine</Table.Th>
                <Table.Th>Device ID</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>State</Table.Th>
                <Table.Th>Updated</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {mergedRows.map((item) => (
                <Table.Tr key={item.device_id}>
                  <Table.Td>{item.machine_name}</Table.Td>
                  <Table.Td>
                    <Text size="xs" ff="monospace">
                      {item.device_id}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={item.status === "Online" ? "teal" : "gray"}>
                      {item.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={statusColor(item.state)}>
                      {item.state === "MATI" ? "Tersedia" : "Digunakan"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{item.source_timestamp ? new Date(item.source_timestamp).toLocaleString("id-ID") : "-"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Modal
        opened={refreshModalOpen}
        onClose={() => {
          if (isRefreshing) return;
          setRefreshModalOpen(false);
        }}
        title="Force Refresh Machine Status"
        centered
      >
        <Stack gap="md">
          <Alert color="yellow" icon={<IconAlertCircle size={16} />} variant="light">
            Melakukan perintah ini akan menimbulkan cost komputasi.
          </Alert>
          <TextInput
            label="Token"
            type="password"
            value={refreshToken}
            onChange={(event) => setRefreshToken(event.currentTarget.value)}
            required
          />
          {refreshResult ? (
            <Alert color={refreshResult.ok ? "green" : "red"} icon={<IconAlertCircle size={16} />} variant="light">
              {refreshResult.message}
            </Alert>
          ) : null}
          <Group justify="flex-end">
            <Button variant="default" disabled={isRefreshing} onClick={() => setRefreshModalOpen(false)}>
              Cancel
            </Button>
            <Button color="red" loading={isRefreshing} onClick={() => void forceRefresh()} disabled={!refreshToken.trim()}>
              Verify & Refresh
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

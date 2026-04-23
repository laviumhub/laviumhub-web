import "server-only";

import type { RawMachineRecord } from "@/data/types/raw-machine";
import { getSupabaseServerClient } from "@/lib/supabase/server-client";

export type MachineStatusRow = {
  device_id: string;
  machine_name: string;
  status: string;
  state: string;
  source_timestamp: string;
  updated_at: string;
};

export type MachineStatusSnapshot = {
  rows: MachineStatusRow[];
  latestSourceTimestamp: string | null;
};

type RefreshRpcResponse = {
  updated_count: number;
};

export async function saveMachineStatusSnapshot(
  machines: RawMachineRecord[],
  sourceTimestampIso: string
): Promise<number> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase.rpc("refresh_machine_status_snapshot", {
    p_payload: machines,
    p_source_timestamp: sourceTimestampIso,
  });

  if (error) {
    throw new Error(`Failed to persist machine snapshot: ${error.message}`);
  }

  const response = data as RefreshRpcResponse[] | RefreshRpcResponse | null;
  const first = Array.isArray(response) ? response[0] : response;
  return Number(first?.updated_count ?? machines.length);
}

export async function listMachineStatuses(): Promise<MachineStatusSnapshot> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("machine_status_latest")
    .select("device_id,machine_name,status,state,source_timestamp,updated_at")
    .order("machine_name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch machine statuses: ${error.message}`);
  }

  const rows = (data ?? []) as MachineStatusRow[];
  const latestSourceTimestamp = rows.reduce<string | null>((latest, row) => {
    if (!latest) return row.source_timestamp;
    return new Date(row.source_timestamp).getTime() > new Date(latest).getTime() ? row.source_timestamp : latest;
  }, null);

  return { rows, latestSourceTimestamp };
}

export async function getLatestMachineRefreshTimestampMs(): Promise<number | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("machine_status_latest")
    .select("source_timestamp")
    .order("source_timestamp", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read latest machine refresh timestamp: ${error.message}`);
  }

  if (!data?.source_timestamp) return null;
  const ms = new Date(String(data.source_timestamp)).getTime();
  return Number.isNaN(ms) ? null : ms;
}

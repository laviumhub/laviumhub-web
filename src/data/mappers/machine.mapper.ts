import type { Machine, MachineAvailability, MachineKind } from "@/domain/machine";
import type { RawMachineRecord } from "@/data/types/raw-machine";

function inferMachineKind(machineName: string): MachineKind {
  if (machineName.includes("Mesin Cuci")) return "washer";
  if (machineName.includes("Pengering")) return "dryer";
  return "unknown";
}

function inferMachineAvailability(raw: RawMachineRecord): MachineAvailability {
  const isOnline = raw.status.toLowerCase() === "online";
  if (!isOnline) return "offline";
  return raw.state.toUpperCase() === "MATI" ? "available" : "in_use";
}

export function mapRawMachineToDomain(raw: RawMachineRecord): Machine {
  return {
    id: raw.device_id,
    name: raw.machine_name,
    kind: inferMachineKind(raw.machine_name),
    availability: inferMachineAvailability(raw),
    isOnline: raw.status.toLowerCase() === "online",
    sourceState: raw.state,
    sourceStatus: raw.status
  };
}

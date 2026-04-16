export type MachineKind = "washer" | "dryer" | "unknown";

export type MachineAvailability = "available" | "in_use" | "offline";

export interface Machine {
  id: string;
  name: string;
  kind: MachineKind;
  availability: MachineAvailability;
  isOnline: boolean;
  sourceState: string;
  sourceStatus: string;
}

export interface MachineSnapshot {
  machines: Machine[];
  fetchedAt: Date;
}

export interface MachineOverview {
  machines: Machine[];
  washers: Machine[];
  dryers: Machine[];
  totalMachines: number;
  availableMachines: number;
  fetchedAt: Date;
}

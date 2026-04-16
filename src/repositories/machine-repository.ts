import type { MachineSnapshot } from "@/domain/machine";

export interface MachineRepository {
  getSnapshot(): Promise<MachineSnapshot>;
}

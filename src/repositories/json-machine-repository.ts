import defaultMachines from "@/data/json/default-machines.json";
import { mapRawMachineToDomain } from "@/data/mappers/machine.mapper";
import type { RawMachineRecord } from "@/data/types/raw-machine";
import type { MachineSnapshot } from "@/domain/machine";
import type { MachineRepository } from "@/repositories/machine-repository";

export class JsonMachineRepository implements MachineRepository {
  async getSnapshot(): Promise<MachineSnapshot> {
    const records = defaultMachines as RawMachineRecord[];

    return {
      machines: records.map(mapRawMachineToDomain),
      fetchedAt: new Date()
    };
  }
}

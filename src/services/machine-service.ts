import type { MachineOverview } from "@/domain/machine";
import type { MachineRepository } from "@/repositories/machine-repository";

export class MachineService {
  constructor(private readonly repository: MachineRepository) {}

  async getOverview(): Promise<MachineOverview> {
    const snapshot = await this.repository.getSnapshot();
    const washers = snapshot.machines.filter((machine) => machine.kind === "washer");
    const dryers = snapshot.machines.filter((machine) => machine.kind === "dryer");
    const availableMachines = snapshot.machines.filter(
      (machine) => machine.availability === "available"
    ).length;

    return {
      machines: snapshot.machines,
      washers,
      dryers,
      totalMachines: snapshot.machines.length,
      availableMachines,
      fetchedAt: snapshot.fetchedAt
    };
  }
}

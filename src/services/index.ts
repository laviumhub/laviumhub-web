import { JsonMachineRepository } from "@/repositories/json-machine-repository";
import { MachineService } from "@/services/machine-service";

const machineRepository = new JsonMachineRepository();

export const machineService = new MachineService(machineRepository);

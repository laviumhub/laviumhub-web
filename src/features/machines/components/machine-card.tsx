import { Badge, Box, Card, Image, Stack, Text } from "@mantine/core";

import type { Machine } from "@/domain/machine";

type MachineCardProps = {
  machine: Machine;
};

const AVAILABILITY_LABEL: Record<Machine["availability"], string> = {
  available: "Tersedia",
  in_use: "Digunakan",
  offline: "Offline"
};

export function MachineCard({ machine }: MachineCardProps) {
  const imagePath = machine.kind === "dryer" ? "/assets/dryer.png" : "/assets/washer.png";
  const active = machine.availability !== "available";

  return (
    <Card
      withBorder
      radius="xl"
      shadow="md"
      p="md"
      style={{
        borderColor: "#900000",
        borderWidth: 2,
        background: active
          ? "linear-gradient(135deg, #fff5f5 0%, #cf2c27 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)",
        height: "100%"
      }}
    >
      <Stack align="center" gap="sm">
        <Box
          style={{
            background: "linear-gradient(135deg, #900000 0%, #c30000 100%)",
            borderRadius: 12,
            padding: 12,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 120,
            width: "100%"
          }}
        >
          <Image src={imagePath} alt={machine.name} h={80} fit="contain" />
        </Box>

        <Text fw={700} size="sm" ta="center" c="#900000" lineClamp={2}>
          {machine.name}
        </Text>

        <Badge
          radius="md"
          size="md"
          style={{
            backgroundColor: machine.availability === "available" ? "#900000" : "#f87171",
            color: "white",
            width: "100%"
          }}
        >
          {AVAILABILITY_LABEL[machine.availability]}
        </Badge>
      </Stack>
    </Card>
  );
}

import { Box, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { IconDroplet, IconWind } from "@tabler/icons-react";

import type { MachineOverview } from "@/domain/machine";
import { MachineSection } from "@/features/machines/components/machine-section";

type MachinesDashboardProps = {
  overview: MachineOverview;
};

export function MachinesDashboard({ overview }: MachinesDashboardProps) {
  return (
    <Stack gap="xl">
      <Paper p="xl" radius="lg" withBorder style={{ borderColor: "#900000" }}>
        <Stack gap="sm" align="center">
          <Title order={1} c="#900000" ta="center">
            Kramat Sentiong
          </Title>
          <Group gap="xl">
            <Box ta="center">
              <Text size="2.5rem" fw={900} c="teal.6">
                {overview.availableMachines}
              </Text>
              <Text fw={600}>Mesin Tersedia</Text>
            </Box>
            <Box ta="center">
              <Text size="2.5rem" fw={900} c="violet.6">
                {overview.totalMachines}
              </Text>
              <Text fw={600}>Total Mesin</Text>
            </Box>
          </Group>
          <Text size="sm" c="dimmed">
            Updated: {overview.fetchedAt.toLocaleString("id-ID")}
          </Text>
        </Stack>
      </Paper>

      <MachineSection title="Mesin Cuci" icon={<IconDroplet size={24} />} machines={overview.washers} />
      <MachineSection title="Pengering" icon={<IconWind size={24} />} machines={overview.dryers} />
    </Stack>
  );
}

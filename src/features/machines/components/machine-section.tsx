import { Box, Grid, GridCol, Group, ThemeIcon, Title } from "@mantine/core";
import type { ReactNode } from "react";

import type { Machine } from "@/domain/machine";
import { MachineCard } from "@/features/machines/components/machine-card";

type MachineSectionProps = {
  title: string;
  icon: ReactNode;
  machines: Machine[];
};

export function MachineSection({ title, icon, machines }: MachineSectionProps) {
  return (
    <Box>
      <Group mb="md" gap="sm">
        <ThemeIcon size="lg" radius="md" variant="light" color="#900000">
          {icon}
        </ThemeIcon>
        <Title order={2} c="#900000">
          {title}
        </Title>
      </Group>

      <Grid gutter="md">
        {machines.map((machine) => (
          <GridCol key={machine.id} span={{ base: 6, md: 3 }}>
            <MachineCard machine={machine} />
          </GridCol>
        ))}
      </Grid>
    </Box>
  );
}

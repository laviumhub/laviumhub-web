import { Card, SimpleGrid, Stack, Text, Title } from "@mantine/core";

export default function AdminDashboardPage() {
  return (
    <Stack gap="lg">
      <Title order={2}>Dashboard</Title>
      <Card withBorder radius="md" p="lg">
        <Stack gap="xs">
          <Text fw={600}>Welcome to LaviumHub Admin</Text>
          <Text c="dimmed">
            This is a placeholder dashboard. Next phase will add auth guard and content modules.
          </Text>
        </Stack>
      </Card>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <Card withBorder radius="md" p="lg">
          <Text fw={600}>Banner</Text>
          <Text c="dimmed" size="sm">
            Module placeholder
          </Text>
        </Card>
        <Card withBorder radius="md" p="lg">
          <Text fw={600}>Services</Text>
          <Text c="dimmed" size="sm">
            Module placeholder
          </Text>
        </Card>
        <Card withBorder radius="md" p="lg">
          <Text fw={600}>Auth</Text>
          <Text c="dimmed" size="sm">
            Pending real auth integration
          </Text>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

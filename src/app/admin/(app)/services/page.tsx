import { Card, Stack, Text, Title } from "@mantine/core";

export default function AdminServicesPage() {
  return (
    <Stack gap="lg">
      <Title order={2}>Services</Title>
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed">
          Services management module placeholder. Editor and persistence will be added in a later phase.
        </Text>
      </Card>
    </Stack>
  );
}

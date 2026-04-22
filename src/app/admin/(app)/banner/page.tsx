import { Card, Stack, Text, Title } from "@mantine/core";

export default function AdminBannerPage() {
  return (
    <Stack gap="lg">
      <Title order={2}>Banner</Title>
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed">
          Banner management module placeholder. CRUD and media integration will be added next phase.
        </Text>
      </Card>
    </Stack>
  );
}

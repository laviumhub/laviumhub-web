import { Card, Stack, Text, Title } from "@mantine/core";

import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <Stack gap="md">
      <Title order={2} ta="center">
        Admin Login
      </Title>
      <Card withBorder radius="md" p="lg">
        <Stack gap="sm">
          <Text c="dimmed" size="sm" ta="center">
            Temporary login flow. Real authentication will be added in a later phase.
          </Text>
          <AdminLoginForm />
        </Stack>
      </Card>
    </Stack>
  );
}

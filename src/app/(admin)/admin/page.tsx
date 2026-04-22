import { Alert, Container, Paper, Stack, Text, Title } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

export const metadata = {
  title: "Admin | LaviumHub",
  description: "Internal admin area"
};

export default function AdminLandingPage() {
  return (
    <Container size="md" py="xl">
      <Paper withBorder radius="md" p="xl">
        <Stack gap="md">
          <Title order={2}>LaviumHub Admin</Title>
          <Text c="dimmed">
            Internal panel is being prepared. Phase v1 will focus on homepage banner content management.
          </Text>
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            Auth and role guard are intentionally deferred to the next phase.
          </Alert>
        </Stack>
      </Paper>
    </Container>
  );
}

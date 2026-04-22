"use client";

import { useRouter } from "next/navigation";
import { Badge, Burger, Button, Group, Text } from "@mantine/core";

type AdminTopbarProps = {
  mobileNavOpened: boolean;
  onToggleMobileNav: () => void;
};

export function AdminTopbar({ mobileNavOpened, onToggleMobileNav }: AdminTopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <Group justify="space-between" px={{ base: "sm", md: "md" }} h="100%">
      <Group gap="sm">
        <Burger
          opened={mobileNavOpened}
          onClick={onToggleMobileNav}
          hiddenFrom="sm"
          size="sm"
          aria-label="Toggle admin navigation"
        />
        <Text fw={700} c="#900000" size="sm">
          LaviumHub Admin
        </Text>
      </Group>
      <Badge variant="light" color="red" visibleFrom="sm">
        Internal
      </Badge>
      <Button variant="light" color="red" size="xs" onClick={handleLogout}>
        Logout
      </Button>
    </Group>
  );
}

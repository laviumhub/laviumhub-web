"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink, Stack, Text, ThemeIcon } from "@mantine/core";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/banner", label: "Banner" },
  { href: "/admin/services", label: "Services" }
];

type AdminSidebarProps = {
  onNavigate?: () => void;
};

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const isPathActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Stack gap="xs" p="md">
      <Text fw={700} c="#900000" size="sm">
        Navigation
      </Text>
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          label={item.label}
          active={isPathActive(item.href)}
          onClick={onNavigate}
          leftSection={
            <ThemeIcon size={18} radius="xl" variant="light" color="red">
              •
            </ThemeIcon>
          }
          variant="light"
          color="red"
        />
      ))}
    </Stack>
  );
}

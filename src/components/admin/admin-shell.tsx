"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell, Drawer } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 48em)");
  const [mobileNavOpened, setMobileNavOpened] = useState(false);

  useEffect(() => {
    setMobileNavOpened(false);
  }, [pathname]);

  function handleToggleMobileNav() {
    setMobileNavOpened((prev) => !prev);
  }

  function handleCloseMobileNav() {
    setMobileNavOpened(false);
  }

  return (
    <>
      <Drawer
        opened={mobileNavOpened}
        onClose={handleCloseMobileNav}
        title="Navigation"
        hiddenFrom="sm"
        padding={0}
        size={260}
      >
        <AdminSidebar onNavigate={handleCloseMobileNav} />
      </Drawer>

      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: true } }}
        padding={{ base: "sm", sm: "md" }}
        styles={{
          main: {
            backgroundColor: "#fafafa",
            minHeight: "100vh"
          }
        }}
      >
        <AppShell.Header
          style={{
            borderBottom: "1px solid #e9ecef",
            backgroundColor: "#fff"
          }}
        >
          <AdminTopbar
            mobileNavOpened={mobileNavOpened}
            onToggleMobileNav={handleToggleMobileNav}
          />
        </AppShell.Header>
        <AppShell.Navbar style={{ borderRight: "1px solid #e9ecef", backgroundColor: "#fff" }}>
          <AdminSidebar />
        </AppShell.Navbar>
        <AppShell.Main>
          <div style={{ maxWidth: isMobile ? "100%" : 1080, margin: "0 auto" }}>{children}</div>
        </AppShell.Main>
      </AppShell>
    </>
  );
}

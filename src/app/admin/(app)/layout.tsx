import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";

type AdminAppLayoutProps = {
  children: ReactNode;
};

export default function AdminAppLayout({ children }: AdminAppLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}

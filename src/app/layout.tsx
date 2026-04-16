import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/carousel/styles.css";
import "@/app/globals.css";

import { ColorSchemeScript } from "@mantine/core";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "LaviumHub",
  description: "Machine information dashboard"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

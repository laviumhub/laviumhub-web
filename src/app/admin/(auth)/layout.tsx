import type { ReactNode } from "react";
import { Box, Container } from "@mantine/core";

type AdminAuthLayoutProps = {
  children: ReactNode;
};

export default function AdminAuthLayout({ children }: AdminAuthLayoutProps) {
  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}
    >
      <Container size={420} w="100%">
        {children}
      </Container>
    </Box>
  );
}

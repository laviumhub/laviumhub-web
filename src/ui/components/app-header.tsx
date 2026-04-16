import { Box, Flex, Group, Image } from "@mantine/core";

export function AppHeader() {
  return (
    <Box
      style={{
        background: "#900000",
        color: "white",
        boxShadow: "0 4px 20px rgba(144, 0, 0, 0.4)"
      }}
    >
      <Flex align="center" justify="space-between" px={{ base: "md", md: "xl" }} py="md">
        <Group gap="md">
          <Image
            src="/assets/lavium-logo.png"
            alt="LaviumHub Logo"
            h={45}
            style={{ objectFit: "contain" }}
          />
        </Group>
      </Flex>
    </Box>
  );
}

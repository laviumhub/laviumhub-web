import { Box, Flex, Group, Image } from '@mantine/core'

export function PublicHeader() {
  return (
    <Box
        style={{
            background: "#900000",
            color: "white",
            boxShadow: "0 4px 20px rgba(144, 0, 0, 0.4)",
        }}
        >
        <Flex align="center" justify="space-between" px={{ base: "md", md: "xl" }} py="md">
            <Group gap="md">
                <Image
                    src="/assets/lavium-logo.png"
                    alt="LaviumHub Logo"
                    height={45}
                    style={{
                        objectFit: "contain",
                        backgroundColor: "transparent",
                    }}
                />
            </Group>
        </Flex>
    </Box>
  )
}

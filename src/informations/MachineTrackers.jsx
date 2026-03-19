import {
    Badge,
    Box,
    Card,
    Grid,
    Group,
    Image,
    Stack,
    Text,
    ThemeIcon,
    Title
} from "@mantine/core"
import { IconWash, IconWindmill } from "@tabler/icons-react"
import dryerImg from "../assets/dryer.png"
import washerImg from "../assets/washer.png"

export default function MachineTrackers({machines}) {
  const washers = machines.filter((m) => m.machine_name.includes("Mesin Cuci"))
  const dryers = machines.filter((m) => m.machine_name.includes("Pengering"))

  return (
    <>
        {/* 🧺 Washer Section */}
        <Box mb="xl">
            <Group mb="md" gap="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="#900000">
                    <IconWash size={24} />
                </ThemeIcon>
                <Title order={2} c="#900000">
                    Mesin Cuci
                </Title>
            </Group>

            <Grid gutter="md">
            {washers.map((m) => (
                <Grid.Col
                    key={m.device_id}
                    span={{ base: 6, md: 3 }}
                >
                    <Card
                        withBorder
                        radius="xl"
                        shadow="md"
                        p="md"
                        style={{
                            borderColor: "#900000",
                            borderWidth: "2px",
                            background:
                                m.state === "MATI"
                                ? "linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)"
                                : "linear-gradient(135deg, #fff5f5 0%, #cf2c27 100%)",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            height: "100%",
                            maxWidth: "320px",
                            margin: "0 auto",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-6px)";
                            e.currentTarget.style.boxShadow = "0 12px 20px rgba(144, 0, 0, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
                        }}
                    >
                        <Stack align="center" gap="sm">
                            <Box
                                style={{
                                    background: "linear-gradient(135deg, #900000 0%, #c30000 100%)",
                                    borderRadius: "12px",
                                    padding: "12px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    minHeight: 120,
                                    width: "100%",
                                    maxWidth: "280px",
                                }}
                            >
                                <Image
                                    src={washerImg}
                                    alt={m.machine_name}
                                    height={80}
                                    fit="contain"
                                    style={{ maxWidth: "90%", margin: "0 auto" }}
                                />
                            </Box>

                            <Text fw={700} size="sm" ta="center" c="#900000" lineClamp={2}>
                                {m.machine_name}
                            </Text>

                            <Badge
                                radius="md"
                                size="md"
                                style={{
                                    backgroundColor: m.state === "MATI" ? "#900000" : "#f87171",
                                    color: "white",
                                    fontWeight: 600,
                                    textAlign: "center",
                                    width: "100%",
                                }}
                            >
                                {m.state === "MATI" ? "✓ Tersedia" : "● Digunakan"}
                            </Badge>
                        </Stack>
                    </Card>
                </Grid.Col>
            ))}
            </Grid>
        </Box>

        {/* 🌪️ Dryer Section */}
        <Box>
            <Group mb="md" gap="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="#900000">
                    <IconWindmill size={24} />
                </ThemeIcon>
                <Title order={2} c="#900000">
                    Pengering
                </Title>
            </Group>

            <Grid gutter="md">
            {dryers.map((m) => (
                <Grid.Col
                    key={m.device_id}
                    span={{ base: 6, md: 3 }}
                >
                    <Card
                        withBorder
                        radius="xl"
                        shadow="md"
                        p="md"
                        style={{
                        borderColor: "#900000",
                        borderWidth: "2px",
                        background:
                            m.state === "MATI"
                            ? "linear-gradient(135deg, #ffffff 0%, #fff5f5 100%)"
                            : "linear-gradient(135deg, #fff5f5 0%, #cf2c27 100%)",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        height: "100%",
                        maxWidth: "320px",
                        margin: "0 auto",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-6px)";
                            e.currentTarget.style.boxShadow = "0 12px 20px rgba(144, 0, 0, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
                        }}
                    >
                        <Stack align="center" gap="sm">
                            <Box
                                style={{
                                background: "linear-gradient(135deg, #900000 0%, #c30000 100%)",
                                borderRadius: "12px",
                                padding: "12px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                minHeight: 120,
                                width: "100%",
                                maxWidth: "280px",
                                }}
                            >
                                <Image
                                src={dryerImg}
                                alt={m.machine_name}
                                height={105}
                                fit="contain"
                                style={{ maxWidth: "90%", margin: "0 auto" }}
                                />
                            </Box>

                            <Text fw={700} size="sm" ta="center" c="#900000" lineClamp={2}>
                                {m.machine_name}
                            </Text>

                            <Badge
                                radius="md"
                                size="md"
                                style={{
                                backgroundColor: m.state === "MATI" ? "#900000" : "#f87171",
                                color: "white",
                                fontWeight: 600,
                                textAlign: "center",
                                width: "100%",
                                }}
                            >
                                {m.state === "MATI" ? "✓ Tersedia" : "● Digunakan"}
                            </Badge>
                        </Stack>
                    </Card>
                </Grid.Col>
            ))}
            </Grid>
        </Box>
    </>
  )
}
import {
  AppShell,
  Badge,
  Box,
  Card,
  Container,
  Flex,
  Grid,
  GridCol,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  Loader,
  Skeleton
} from "@mantine/core"
import { IconBrandInstagram, IconBrandWhatsapp, IconInfoCircle, IconWash, IconWindmill } from "@tabler/icons-react"
import dayjs from "dayjs"
import 'dayjs/locale/id'
import { useEffect, useState } from "react"
import dryerImg from "./assets/dryer.png"
import laviumLogo from "./assets/lavium-logo.png"
import washerImg from "./assets/washer.png"

dayjs.locale('id')

const default_machines = [
  { machine_name: "Mesin Cuci No 1", device_id: "WML_8CAAB5CBA3B6", status: "Online", state: "MATI" },
  { machine_name: "Mesin Cuci No 2", device_id: "WML_500291D4D9AF", status: "Online", state: "MATI" },
  { machine_name: "Mesin Cuci No 3", device_id: "WML_D8BFC006C28D", status: "Online", state: "MATI" },
  { machine_name: "Mesin Cuci No 4", device_id: "WML_C8C9A3B263FB", status: "Online", state: "MATI" },
  { machine_name: "Pengering 1", device_id: "DM_D48AFC354143", status: "Online", state: "MATI" },
  { machine_name: "Pengering 2", device_id: "DM_34987AE0F167", status: "Online", state: "MATI" },
  { machine_name: "Pengering 3", device_id: "DM_EC94CB9F6866", status: "Online", state: "MATI" },
  { machine_name: "Pengering 4", device_id: "DM_D48AFC325C9B", status: "Online", state: "MATI" },
]

export default function App() {
  const [lastUpdate, setLastUpdate] = useState(null)
  const [machines, setMachines] = useState(default_machines)

  const washers = machines.filter((m) => m.machine_name.includes("Mesin Cuci"))
  const dryers = machines.filter((m) => m.machine_name.includes("Pengering"))
  const total = machines.length
  const available = machines.filter((m) => m.state === "MATI").length

  const fetchData = async () => {
    try {
      const res = await fetch('https://d-agung.com/scrapper/scrapper.php?key=8c14c1035d8cdbe9c69270820d7bb08d0de9dc01d8d05b3dc6bd58b47bee20a0');
      const data = await res.json();
      setMachines(data.data);
      setLastUpdate(dayjs(data.timestamp).format('DD MMMM YYYY HH:mm:ss'));
    } catch (err) {
      console.error(err);
      setMachines(default_machines);
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 180000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AppShell
      padding="md"
      styles={{
        main: {
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* 🔻 HEADER */}
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
              src={laviumLogo}
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

      {/* 🔻 CONTENT */}
      <Box style={{ flex: 1 }}>
        <Container
          size="xl"
          py="xl"
          style={{ 
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto'
          }}
        >
          <Grid>
            {/* LEFT PANEL */}
            <GridCol span={{ base: 12, md: 6 }}>
              <Paper
                radius="xl"
                p={{ base: 'md', md: 'xl' }}
                shadow="xl"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  height: "100%",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                <Stack align="center" gap={{base: 'sm', md: 'md'}}>
                  <Title
                    order={1}
                    ta="center"
                    style={{
                      background: "#900000",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: "2.5rem",
                      fontWeight: 900,
                    }}
                  >
                    Kramat Sentiong
                  </Title>
                  <Group gap={{base: 'xs', md: 'md'}}>
                    <Box ta="center">
                      <Text size="3rem" fw={900} c="teal.6">
                        {available}
                      </Text>
                      <Text size="lg" fw={600} c="gray.7">
                        Mesin Tersedia
                      </Text>
                    </Box>
                    <Box
                      style={{
                        width: "2px",
                        height: "60px",
                        background: "linear-gradient(180deg, #900000 0%, #ff4d4d 100%)",
                      }}
                    />
                    <Box ta="center">
                      <Text size="3rem" fw={900} c="violet.6">
                        {total}
                      </Text>
                      <Text size="lg" fw={600} c="gray.7">
                        Total Mesin
                      </Text>
                    </Box>
                  </Group>
                  {lastUpdate ?
                    <Group>
                      <Tooltip label='Data akan diperbarui setiap 3 menit' visibleFrom="md">
                        <IconInfoCircle size={14} color='blue' />
                      </Tooltip>
                      <Text>
                        {lastUpdate}
                      </Text>
                    </Group>
                    : <Skeleton h='lg' w={'100%'}/>
                  }
                </Stack>
              </Paper>
            </GridCol>

            {/* RIGHT PANEL */}
            <GridCol span={{ base: 12, md: 6 }}>
              {/* 🧺 Washer Section */}
              <Box mb="xl">
                <Group mb="md" gap="sm">
                  <ThemeIcon size="lg" radius="md" variant="light" color="#900000">
                    <IconWash size={24} />
                  </ThemeIcon>
                  <Title order={2} c="#900000">
                    🧺 Mesin Cuci
                  </Title>
                </Group>

                <Grid gutter="md">
                  {washers.map((m) => (
                    <Grid.Col
                      key={m.device_id}
                      span={{ base: 6, md: 3 }} // ✅ 1 per row on mobile, 2 on tablet, 4 on desktop
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
                    🌪️ Pengering
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
            </GridCol>
          </Grid>
        </Container>
      </Box>

      {/* 🔻 FOOTER */}
      <Box
        style={{
          background: "#900000",
          color: "white",
          boxShadow: "0 -4px 20px rgba(144, 0, 0, 0.3)",
        }}
        p="lg"
      >
        <Container size="xl">
          <Grid gutter={{ base: "md", md: "xl" }} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack align="center" gap="xs">
                <Image src={laviumLogo} alt="LaviumHub Logo" height={40} fit="contain" />
                <Group
                  onClick={()=> window.open("https://wa.me/6285117674118", "_blank")}
                  style={{cursor: 'pointer'}}
                >
                  <IconBrandWhatsapp />
                  <Text>085117674118</Text>
                </Group>
                <Group
                  onClick={()=> window.open("https://www.instagram.com/laviumhub", "_blank")}
                  style={{cursor: 'pointer'}}
                >
                  <IconBrandInstagram />
                  <Text>laviumhub</Text>
                </Group>
                <Text size="md" c="white" opacity={0.95} ta="center">
                  Jl. Kramat Sentiong No 14, Senen, Jakarta Pusat
                </Text>
                <Text size="md" mt={4} c="white" fw={600} ta="center">
                  <strong>Buka:</strong> Selasa–Minggu 06.00–23.00 | Senin 16.30–23.00
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  maxWidth: "600px",
                  margin: "0 auto",
                }}
              >
                <iframe
                  src="https://www.google.com/maps?q=-6.187578,106.8480378&z=20&output=embed"
                  width="100%"
                  height="250"
                  style={{ border: 0, borderRadius: "12px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="LaviumHub Location"
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
    </AppShell>
  );
}
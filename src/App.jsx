import { Carousel } from "@mantine/carousel"
import {
  AppShell,
  Badge,
  Blockquote,
  Box,
  Card,
  Container,
  Flex,
  Grid,
  GridCol,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  Tooltip
} from "@mantine/core"
import { IconBrandInstagram, IconBrandWhatsapp, IconInfoCircle, IconWash, IconWindmill } from "@tabler/icons-react"
import dayjs from "dayjs"
import 'dayjs/locale/id'
import Autoplay from 'embla-carousel-autoplay'
import { useEffect, useRef, useState } from "react"
import dryerImg from "./assets/dryer.png"
import laviumLogo from "./assets/lavium-logo.png"
import washerImg from "./assets/washer.png"
import thumbnailImg from "/thumbnail.png"
dayjs.locale('id')

const tabs = [
  { key: 'informasi', label: 'Informasi'},
  { key: 'layanan', label: 'Layanan'}
]

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
  const [activeTab, setActiveTab] = useState('informasi');
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

  const autoplayNyuri = useRef(Autoplay({ delay: 3000}))
  const autoplayNyopet = useRef(Autoplay({ delay: 3000}))
  const autoplayNyelip = useRef(Autoplay({ delay: 3000}))
  const autoplayNyesat = useRef(Autoplay({ delay: 3000}))

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
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <style>{`
        .custom-tab {
          background-color: rgba(255,255,255,0.6);
          color: #900000;
        }
        .custom-tab[data-active], .custom-tab[data-active="true"] {
          background-color: #900000 !important;
          color: #fff !important;
        }
      `}</style>

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
            <GridCol span={{ base: 12, md: 4 }}>
              <Tabs
                value={activeTab}
                onChange={setActiveTab}
                styles={{
                  root: {
                    maxWidth: "600px",
                    margin: "0 auto",
                  },
                  list: {
                    border: 'none',
                    gap: '4px',
                  },
                  tab: {
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid #900000',
                    borderBottom: 'none',
                    borderRadius: '12px 12px 0 0',
                    padding: '12px 24px',
                    fontWeight: 600,
                    color: '#900000',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(0)',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      transform: 'translateY(-2px)',
                    },
                  },
                  panel: {
                    marginTop: '-2px',
                  }
                }}
              >
                <Tabs.List>
                  {tabs.map((tb) => (
                    <Tabs.Tab key={tb.key} value={tb.key} className="custom-tab">{tb.label}</Tabs.Tab>
                  ))}
                </Tabs.List>
                

                <Tabs.Panel value="informasi">
                  <Box 
                    key={`panel-informasi-${activeTab}`}
                    style={{ 
                      position: 'relative',
                      animation: 'fadeSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {/* Stack Effect - Bottom Layer */}
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '8px',
                        right: '-8px',
                        height: '100%',
                        background: 'rgba(144, 0, 0, 0.1)',
                        border: '2px solid rgba(144, 0, 0, 0.3)',
                        borderRadius: '0 12px 12px 12px',
                        zIndex: 1,
                        transition: 'all 0.4s ease',
                      }}
                    />
                    {/* Stack Effect - Middle Layer */}
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '4px',
                        right: '-4px',
                        height: '100%',
                        background: 'rgba(144, 0, 0, 0.15)',
                        border: '2px solid rgba(144, 0, 0, 0.4)',
                        borderRadius: '0 12px 12px 12px',
                        zIndex: 2,
                        transition: 'all 0.4s ease',
                      }}
                    />
                    {/* Main Content */}
                    <Paper
                      p={{ base: 'md', md: 'xl' }}
                      shadow="xl"
                      style={{
                        position: 'relative',
                        zIndex: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: '2px solid #900000',
                        borderRadius: '0 12px 12px 12px',
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        minHeight: "400px",
                        transition: 'all 0.4s ease',
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
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="nilai">
                  <Box
                    key={`panel-nilai-${activeTab}`}
                    style={{ 
                      position: 'relative',
                      animation: 'fadeSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '8px',
                        right: '-8px',
                        height: '100%',
                        background: 'rgba(144, 0, 0, 0.1)',
                        border: '2px solid rgba(144, 0, 0, 0.3)',
                        borderRadius: '0 12px 12px 12px',
                        zIndex: 1,
                        transition: 'all 0.4s ease',
                      }}
                    />
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '4px',
                        right: '-4px',
                        height: '100%',
                        background: 'rgba(144, 0, 0, 0.15)',
                        border: '2px solid rgba(144, 0, 0, 0.4)',
                        borderRadius: '0 12px 12px 12px',
                        zIndex: 2,
                        transition: 'all 0.4s ease',
                      }}
                    />
                    <Paper
                      p={{ base: 'md', md: 'xl' }}
                      shadow="xl"
                      style={{
                        position: 'relative',
                        zIndex: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: '2px solid #900000',
                        borderRadius: '0 12px 12px 12px',
                        minHeight: "400px",
                        transition: 'all 0.4s ease',
                      }}
                    >
                      <Text ta="center" c="gray.6">Konten Nilai</Text>
                    </Paper>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="layanan">
                  <Box
                    key={`panel-layanan-${activeTab}`}
                    style={{
                      position: 'relative',
                      animation: 'fadeSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '8px',
                        right: '-8px',
                        height: '100%',
                        background: 'rgba(144, 0, 0, 0.1)',
                        border: '2px solid rgba(144, 0, 0, 0.3)',
                        borderRadius: '0 12px 12px 12px',
                        zIndex: 1,
                        transition: 'all 0.4s ease',
                      }}
                    />
                    <Box
                      style={{
                        position: 'absolute',
                        bottom: '-4px',
                        left: '4px',
                        right: '-4px',
                        height: '100%',
                        background: 'rgba(144, 0, 0, 0.15)',
                        border: '2px solid rgba(144, 0, 0, 0.4)',
                        borderRadius: '0 12px 12px 12px',
                        zIndex: 2,
                        transition: 'all 0.4s ease',
                      }}
                    />
                    <Paper
                      p={{ base: 'md', md: 'xl' }}
                      shadow="xl"
                      style={{
                        position: 'relative',
                        zIndex: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: '2px solid #900000',
                        borderRadius: '0 12px 12px 12px',
                        minHeight: "400px",
                        transition: 'all 0.4s ease',
                      }}
                    >
                      <Text ta="center" fw={700} size="xl" py="md">
                        Empat gaya nyuci, satu tempat yang bisa kamu percaya.
                      </Text>
                      <Text ta="center" size="lg" c="dimmed" py="lg">
                        LaviumHub hadir untuk semua kebutuhan laundry — dari yang mandiri sampai yang butuh perhatian ekstra.
                        Karena setiap pakaian layak dapat perawatan terbaik.
                      </Text>
                    </Paper>
                  </Box>
                </Tabs.Panel>
              </Tabs>
            </GridCol>

            {/* RIGHT PANEL */}
            <GridCol span={{ base: 12, md: 8 }}>
              {activeTab === 'informasi' &&
              <>
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
              }

              {activeTab === 'layanan' &&
              <Grid>
                <GridCol span={{base: 12, sm: 6}}>
                  <Card
                    shadow="sm"
                    padding="lg"
                  >
                    <Card.Section>
                      <Carousel
                        withIndicators
                        height={280}
                        styles={{
                          root: { width: '100%' },
                          viewport: { height: '100%' },
                          slide: { height: '100%' },
                        }}
                        plugins={[autoplayNyuri.current]}
                        loop
                        onMouseEnter={autoplayNyuri.current.stop}
                        onMouseLeave={() => autoplayNyuri.current.play()}
                      >
                        <Carousel.Slide>
                          <Image
                            src="services/nyuri_1.jpeg"
                            h="280px"
                            alt="Nyuri"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyuri_2.jpeg"
                            h="280px"
                            alt="Nyuri"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyuri_3.jpeg"
                            h="280px"
                            alt="Nyuri"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                      </Carousel>
                    </Card.Section>

                    <Group justify="space-between">
                      <Text fw={500} size="lg" mt="md">
                        Nyuci Sendiri
                      </Text>
                      <Badge size="lg">
                        NYURI
                      </Badge>
                    </Group>

                    <Text my='xs' fw={700}>
                      💧 Bebas, hemat, dan cepat!
                    </Text>

                    <Text size="sm">
                      Cocok buat kamu yang ingin mencuci
                      sendiri tanpa antre. Cukup datang, pilih mesin, dan mulai mencuci.
                    </Text>

                    <Blockquote my='xs' py="xs">
                      <b>Tidak</b> termasuk sabun & pewangi.<br/>
                      Kapasitas hingga <b>8 kg</b>.
                    </Blockquote>

                    <Text size="sm"c="dimmed">
                      🕒 Atur waktu dan hasil cucimu sendiri.
                    </Text>
                  </Card>
                </GridCol>
                <GridCol span={{base: 12, sm: 6}}>
                  <Card
                    shadow="sm"
                    padding="lg"
                  >
                    <Card.Section>
                      <Carousel
                        withIndicators
                        height={280}
                        styles={{
                          root: { width: '100%' },
                          viewport: { height: '100%' },
                          slide: { height: '100%' },
                        }}
                        plugins={[autoplayNyopet.current]}
                        loop
                        onMouseEnter={autoplayNyopet.current.stop}
                        onMouseLeave={() => autoplayNyopet.current.play()}
                      >
                        <Carousel.Slide>
                          <Image
                            src="services/nyopet_1.jpeg"
                            h="280px"
                            alt="Nyopet"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyopet_2.jpeg"
                            h="280px"
                            alt="Nyopet"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyopet_3.jpeg"
                            h="280px"
                            alt="Nyopet"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                      </Carousel>
                    </Card.Section>

                    <Group justify="space-between">
                      <Text fw={500} size="lg" mt="md">
                        Nyoeroeh Petoegas
                      </Text>
                      <Badge size="lg">
                        NYOPET
                      </Badge>
                    </Group>

                    <Text my='xs' fw={700}>
                      🙌 Titip, tinggal, beres!
                    </Text>

                    <Text size="sm">
                      Berikan pakaian, sabun, dan pewangi favoritmu.
                      Biar petugas kami yang mencucikan dan mengeringkan.
                    </Text>

                    <Blockquote my='xs' py="xs">
                      <b>Tidak</b> termasuk sabun & pewangi.<br/>
                      Kapasitas hingga <b>8 kg</b>.
                    </Blockquote>

                    <Text size="sm"c="dimmed">
                      🚀 Solusi praktis tanpa harus nunggu lama.
                    </Text>
                  </Card>
                </GridCol>
                <GridCol span={{base: 12, sm: 6}}>
                  <Card
                    shadow="sm"
                    padding="lg"
                  >
                    <Card.Section>
                      <Carousel
                        withIndicators
                        height={280}
                        styles={{
                          root: { width: '100%' },
                          viewport: { height: '100%' },
                          slide: { height: '100%' },
                        }}
                        plugins={[autoplayNyelip.current]}
                        loop
                        onMouseEnter={autoplayNyelip.current.stop}
                        onMouseLeave={() => autoplayNyelip.current.play()}
                      >
                        <Carousel.Slide>
                          <Image
                            src="services/nyelip_1.jpeg"
                            h="280px"
                            alt="Nyelip"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyelip_2.jpeg"
                            h="280px"
                            alt="Nyelip"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyelip_3.jpeg"
                            h="280px"
                            alt="Nyelip"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyelip_4.jpeg"
                            h="280px"
                            alt="Nyelip"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                      </Carousel>
                    </Card.Section>

                    <Group justify="space-between">
                      <Text fw={500} size="lg" mt="md">
                        Nyeuci + Lipat
                      </Text>
                      <Badge size="lg">
                        NYELIP
                      </Badge>
                    </Group>

                    <Text my='xs' fw={700}>
                      🧼 Cuci, kering, lipat — langsung wangi!
                    </Text>

                    <Text size="sm">
                      Layanan terima beres buat kamu yang pengen semuanya praktis.
                      Sudah termasuk deterjen & pewangi premium, plus dilipat rapi siap masuk lemari.
                    </Text>

                    <Blockquote my='xs' py="xs">
                      <b>Tidak</b> termasuk pewangi.<br/>
                      Dihitung <b>per kilo</b>.
                    </Blockquote>

                    <Text size="sm"c="dimmed">
                      ✨ Cucian bersih, rapi, dan wangi tanpa repot.
                    </Text>
                  </Card>
                </GridCol>
                <GridCol span={{base: 12, sm: 6}}>
                  <Card
                    shadow="sm"
                    padding="lg"
                  >
                    <Card.Section>
                      <Carousel
                        withIndicators
                        height={280}
                        styles={{
                          root: { width: '100%' },
                          viewport: { height: '100%' },
                          slide: { height: '100%' },
                        }}
                        plugins={[autoplayNyesat.current]}
                        loop
                        onMouseEnter={autoplayNyesat.current.stop}
                        onMouseLeave={() => autoplayNyesat.current.play()}
                      >
                        <Carousel.Slide>
                          <Image
                            src="services/nyesat_1.jpeg"
                            h="280px"
                            alt="Nyesat"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyesat_2.jpeg"
                            h="280px"
                            alt="Nyesat"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                        <Carousel.Slide>
                          <Image
                            src="services/nyesat_3.jpeg"
                            h="280px"
                            alt="Nyesat"
                            fallbackSrc={thumbnailImg}
                            fit="cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Carousel.Slide>
                      </Carousel>
                    </Card.Section>

                    <Group justify="space-between">
                      <Text fw={500} size="lg" mt="md">
                        Nyeuci Satuan
                      </Text>
                      <Badge size="lg">
                        NYESAT
                      </Badge>
                    </Group>

                    <Text my='xs' fw={700}>
                      👕 Perawatan ekstra untuk pakaian spesial!
                    </Text>

                    <Text size="sm">
                      Layanan premium harga minimum cocok untuk item tertentu seperti <i>bed cover</i>, sprei, handuk, dan lainnya.
                      Setiap item dirawat dan dikemas dengan rapi satu per satu.
                    </Text>

                    <Blockquote my='xs' py="xs">
                      <b>Tidak</b> termasuk pewangi.<br/>
                      Dihitung <b>per item</b>.
                    </Blockquote>

                    <Text size="sm"c="dimmed">
                      💎 Karena pakaian spesial butuh perhatian lebih.
                    </Text>
                  </Card>
                </GridCol>
              </Grid>
              }
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
  )
}
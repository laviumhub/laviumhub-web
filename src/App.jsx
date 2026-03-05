import {
  AppShell,
  Box,
  Container,
  Grid,
  GridCol,
  Group,
  Paper,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip
} from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconInfoCircle } from "@tabler/icons-react"
import dayjs from "dayjs"
import 'dayjs/locale/id'
import { useEffect, useState } from "react"
import Delivery from "./Delivery"
import DEFAULT_MACHINES from "./data/DEFAULT_MACHINES.json"
import MachineTrackers from "./informations/MachineTrackers"
import ServicesContent from "./services/ServicesContent"
import Footer from "./shared/Footer"
import Header from "./shared/Header"
dayjs.locale('id')

const tabs = [
  { key: 'informasi', label: 'Informasi'},
  { key: 'layanan', label: 'Layanan'},
  { key: 'antar-jemput', label: 'Antar Jemput'}
]

export default function App() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [activeTab, setActiveTab] = useState('informasi')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [machines, setMachines] = useState(DEFAULT_MACHINES)

  const total = machines.length
  const available = machines.filter((m) => m.state === "MATI").length

  const handleInfoClick = () => {
    notifications.show({
      title: 'Informasi',
      message: 'Data akan diperbarui setiap 3 menit',
      loading: false,
      autoClose: 2000,
    })
  }

  const fetchData = async () => {
    try {
      const res = await fetch('https://d-agung.com/scrapper/scrapper.php?key=8c14c1035d8cdbe9c69270820d7bb08d0de9dc01d8d05b3dc6bd58b47bee20a0')
      const data = await res.json()
      setMachines(data.data)
      setLastUpdate(dayjs(data.timestamp).format('DD MMMM YYYY HH:mm:ss'))
    } catch (err) {
      console.error(err)
      setMachines(DEFAULT_MACHINES)
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
        @keyframes pulseBadge {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.65; transform: scale(1.06); }
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
        .new-badge {
          margin-left: 8px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.4px;
          padding: 2px 6px;
          border-radius: 999px;
          background: #ffcc00;
          color: #6b0000;
          animation: pulseBadge 1s ease-in-out infinite;
          display: inline-block;
          vertical-align: middle;
        }
        @media (max-width: 768px) {
          .custom-tab.tab-antar-jemput {
            grid-column: 1 / -1;
          }
        }
      `}</style>

      <Header />

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
                    gap: isMobile ? '8px' : '4px',
                    display: isMobile ? 'grid' : 'flex',
                    gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : undefined,
                  },
                  tab: {
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    border: '2px solid #900000',
                    borderBottom: isMobile ? '2px solid #900000' : 'none',
                    borderRadius: isMobile ? '12px' : '12px 12px 0 0',
                    padding: isMobile ? '10px 12px' : '12px 24px',
                    fontWeight: 600,
                    color: '#900000',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(0)',
                    position: 'relative',
                    justifyContent: 'center',
                    minHeight: isMobile ? '54px' : undefined,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      transform: 'translateY(-2px)',
                    },
                  },
                  panel: {
                    marginTop: isMobile ? '10px' : '-2px',
                  }
                }}
              >
                <Tabs.List>
                  {tabs.map((tb) => (
                    <Tabs.Tab
                      key={tb.key}
                      value={tb.key}
                      className={`custom-tab ${tb.key === 'antar-jemput' ? 'tab-antar-jemput' : ''}`}
                    >
                      {tb.label}
                      {tb.key === 'antar-jemput' ? <span className="new-badge">BARU</span> : null}
                    </Tabs.Tab>
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
                      <Group>
                      {lastUpdate ? (
                        <>
                          {isMobile ? (
                            <IconInfoCircle size={14} color='blue' onClick={handleInfoClick} style={{ cursor: 'pointer' }} />
                          ) : (
                            <Tooltip label='Data akan diperbarui setiap 3 menit' visibleFrom="md">
                              <IconInfoCircle size={14} color='blue' />
                            </Tooltip>
                          )}
                          <Text>{lastUpdate}</Text>
                        </>
                      ) : (
                        <Skeleton h='lg' w={'100%'} />
                      )}
                      </Group>
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
                        Lima gaya nyuci, satu tempat yang bisa kamu percaya.
                      </Text>
                      <Text ta="center" size="lg" c="dimmed" py="lg">
                        LaviumHub hadir untuk semua kebutuhan laundry — dari yang mandiri sampai yang butuh perhatian ekstra.
                        Karena setiap pakaian layak dapat perawatan terbaik.
                      </Text>
                    </Paper>
                  </Box>
                </Tabs.Panel>

                <Tabs.Panel value="antar-jemput">
                  <Box
                    key={`panel-antar-jemput-${activeTab}`}
                    style={{
                      position: 'relative',
                      animation: 'fadeSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    {!isMobile && (
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
                    )}
                    {!isMobile && (
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
                    )}
                    <Paper
                      p={{ base: 'lg', md: 'xl' }}
                      shadow="xl"
                      style={{
                        position: 'relative',
                        zIndex: 3,
                        background: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: '2px solid #900000',
                        borderRadius: isMobile ? '14px' : '0 12px 12px 12px',
                        minHeight: isMobile ? "auto" : "400px",
                        transition: 'all 0.4s ease',
                      }}
                    >
                      <Text ta="center" fw={800} size={isMobile ? "lg" : "xl"} py={isMobile ? "xs" : "md"}>
                        Antar jemput premium, solusi praktis untuk kebutuhanmu.
                      </Text>
                      <Stack gap={isMobile ? "sm" : "xs"} px={{ base: 0, md: 'sm' }} pt="xs">
                        <Text size={isMobile ? "sm" : "md"} c="dimmed" fw={600}>
                          Promo terbatas!
                        </Text>
                        <Text size={isMobile ? "sm" : "md"} c="dimmed">
                          1. Dibuka 4 slot alamat untuk pengambilan rutin. Jadwalkan sekarang sebelum kuota minggu ini penuh.
                        </Text>
                        <Text size={isMobile ? "sm" : "md"} c="dimmed">
                          2. Ajak temanmu dan dapatkan potongan Rp2.000 untuk setiap orang yang berhasil bergabung.
                        </Text>
                        <Text size={isMobile ? "sm" : "md"} c="dimmed">
                          3. Harga berlaku untuk kisaran +/- 15 kg per pengambilan. Di atas itu dihitung 2x pengiriman.
                        </Text>
                      </Stack>
                    </Paper>
                  </Box>
                </Tabs.Panel>
              </Tabs>
            </GridCol>

            {/* RIGHT PANEL */}
            <GridCol span={{ base: 12, md: 8 }}>
              {activeTab === 'informasi' &&
                <MachineTrackers machines={machines} />
              }

              {activeTab === 'layanan' &&
                <ServicesContent />
              }

              {activeTab === 'antar-jemput' &&
                <Delivery />
              }
            </GridCol>
          </Grid>
        </Container>
      </Box>
      
      <Footer />
    </AppShell>
  )
}

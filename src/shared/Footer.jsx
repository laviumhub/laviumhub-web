import { Box, Container, Grid, Group, Image, Stack, Text } from '@mantine/core'
import { IconBrandFacebook, IconBrandInstagram, IconBrandTiktok, IconBrandWhatsapp, IconMapPin, IconPin, IconPinned } from "@tabler/icons-react"
import laviumLogo from "../assets/lavium-logo.png"

const Footer = () => {
  return (
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
                <Group >
                  <Group
                    onClick={()=> window.open("https://www.instagram.com/laviumhub", "_blank")}
                    style={{cursor: 'pointer'}}
                  >
                    <IconBrandInstagram />
                  </Group> |
                  <Group
                    onClick={()=> window.open("https://tiktok.com/@laviumhub", "_blank")}
                    style={{cursor: 'pointer'}}
                  >
                    <IconBrandTiktok />
                  </Group> |
                  <Group
                    onClick={()=> window.open("https://www.facebook.com/profile.php?id=61582385467564", "_blank")}
                    style={{cursor: 'pointer'}}
                  >
                    <IconBrandFacebook />
                  </Group>
                </Group>
                <Group>
                  <IconMapPin />
                <Text size="md" c="white" opacity={0.95} ta="center">
                  Jl. Kramat Sentiong No 14, Senen, Jakarta Pusat
                </Text>
                </Group>
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
  )
}

export default Footer
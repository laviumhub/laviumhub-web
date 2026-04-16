import { Carousel } from "@mantine/carousel"
import { Badge, Blockquote, Card, Grid, GridCol, Group, Image, Stack, Text, Title } from "@mantine/core"
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from "react"
import SERVICES_DATA from "../data/SERVICES_DATA.json"

type ServiceContent = {
  id: string
  title: string
  badge: string
  headline: string
  description: string
  blockquote: {
    line1: string
    line2?: string
  }
  footer: string
  images: string[]
}

type ServiceCardProps = {
  service: ServiceContent
}

function ServiceCard({ service }: ServiceCardProps) {
  const autoplay = useRef(Autoplay({ delay: 3000 }))

  return (
    <GridCol span={{ base: 12, sm: 6 }} key={service.id}>
      <Card shadow="sm" padding="lg">
        <Card.Section>
          <Carousel
            withIndicators
            height={280}
            styles={{
              root: { width: '100%' },
              viewport: { height: '100%' },
              slide: { height: '100%' },
            }}
            plugins={[autoplay.current]}
            emblaOptions={{ loop: true }}
            onMouseEnter={autoplay.current.stop}
            onMouseLeave={() => autoplay.current.play()}
          >
            {service.images.map((img, idx) => (
              <Carousel.Slide key={idx}>
                <Image
                  src={img}
                  h="280px"
                  alt={service.badge}
                  fallbackSrc="/thumbnail.png"
                  fit="cover"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        </Card.Section>

        <Group justify="space-between">
          <Text fw={500} size="lg" mt="md">
            {service.title}
          </Text>
          <Badge size="lg">{service.badge}</Badge>
        </Group>

        <Text my="xs" fw={700}>
          {service.headline}
        </Text>

        <Text size="sm">{service.description}</Text>

        <Blockquote my="xs" py="xs">
          <span dangerouslySetInnerHTML={{ __html: service.blockquote.line1 }} />
          {service.blockquote.line2 ? (
            <>
              <br />
              <span dangerouslySetInnerHTML={{ __html: service.blockquote.line2 }} />
            </>
          ) : null}
        </Blockquote>

        <Text size="sm" c="dimmed">
          {service.footer}
        </Text>
      </Card>
    </GridCol>
  )
}

export default function ServicesContent() {
  const services = SERVICES_DATA as ServiceContent[]

  return (
    <Grid>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
      
      <GridCol span={{ base: 12}}>
        <Title>
          Tambahan:
        </Title>
        <Stack gap='sm'>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <Text fw={500} size="lg" mt="md">
                🧺 Pisah Baju Putih / Bernoda
              </Text>
              <Badge size="lg" color="gray">WHITE</Badge>
            </Group>

            <Text size="sm" mt="xs">
              ✨ Layanan khusus untuk menjaga pakaian putihmu tetap cerah tanpa khawatir luntur!  
              Kami pisahkan proses pencucian agar baju putih dan bernoda mendapat perawatan ekstra, hasilnya lebih bersih, aman, dan wangi tahan lama.
            </Text>

            <Blockquote my="xs" py="xs">
              🔸 Khusus layanan <b>NYELIP.</b><br/>
              ⚖️ Berat maksimal: <b>0 – 3 kg.</b>
            </Blockquote>
          </Card>
          <Card shadow="sm" padding="lg">
            <Group justify="space-between">
              <Text fw={500} size="lg" mt="md">
                👔 Jasa Setrika Aja
              </Text>
              <Badge size="lg" color="gray">Setrika</Badge>
            </Group>

            <Text size="sm" mt="xs">
              🔥 Layanan simpel buat kamu yang cuma butuh bajunya disetrika.
              Pakaian jadi rapi, halus, dan siap pakai tanpa ribet.
            </Text>

            <Blockquote my="xs" py="xs">
              🔸 Dihitung <b>per kilo.</b><br/>
              ⚖️ 1 atau 2 pcs dianggap <b>1 kg.</b>
            </Blockquote>
          </Card>
        </Stack>
      </GridCol>
    </Grid>
  )
}

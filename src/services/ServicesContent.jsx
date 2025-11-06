import { Carousel } from "@mantine/carousel"
import { Badge, Blockquote, Card, Grid, GridCol, Group, Image, Text, Title } from "@mantine/core"
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from "react"
import SERVICES_DATA from "../data/SERVICES_DATA.json"
import thumbnailImg from "/thumbnail.png"

function ServiceCard({ service }) {
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
            loop
            onMouseEnter={autoplay.current.stop}
            onMouseLeave={() => autoplay.current.play()}
          >
            {service.images.map((img, idx) => (
              <Carousel.Slide key={idx}>
                <Image
                  src={img}
                  h="280px"
                  alt={service.badge}
                  fallbackSrc={thumbnailImg}
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
          <br />
          <span dangerouslySetInnerHTML={{ __html: service.blockquote.line2 }} />
        </Blockquote>

        <Text size="sm" c="dimmed">
          {service.footer}
        </Text>
      </Card>
    </GridCol>
  )
}

export default function ServicesContent() {
  return (
    <Grid>
      {SERVICES_DATA.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
      
      <GridCol span={{ base: 12}}>
        <Title>
          Tambahan:
        </Title>
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
      </GridCol>
    </Grid>
  )
}
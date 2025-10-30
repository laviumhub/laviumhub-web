import { Carousel } from "@mantine/carousel"
import { Badge, Blockquote, Card, Grid, GridCol, Group, Image, Text } from "@mantine/core"
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from "react"
import thumbnailImg from "/thumbnail.png"
import SERVICES_DATA from "../data/SERVICES_DATA.json"

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
    </Grid>
  )
}
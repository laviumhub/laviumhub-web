import { Carousel } from "@mantine/carousel"
import { Badge, Blockquote, Card, Grid, GridCol, Group, Image, Text } from "@mantine/core"
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from "react"
import thumbnailImg from "/thumbnail.png"

export default function ServicesContent() {
  const autoplayNyuri = useRef(Autoplay({ delay: 3000}))
  const autoplayNyopet = useRef(Autoplay({ delay: 3000}))
  const autoplayNyelip = useRef(Autoplay({ delay: 3000}))
  const autoplayNyesat = useRef(Autoplay({ delay: 3000}))

  return (
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
  )
}
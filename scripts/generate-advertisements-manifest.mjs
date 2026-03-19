import { readdir, writeFile } from "node:fs/promises"
import path from "node:path"

const rootDir = process.cwd()
const adsDir = path.join(rootDir, "public", "advertisements")
const outputPath = path.join(adsDir, "manifest.json")

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"])

async function generateManifest() {
  const entries = await readdir(adsDir, { withFileTypes: true })

  const images = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => allowedExtensions.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((fileName) => `advertisements/${fileName}`)

  const payload = {
    generatedAt: new Date().toISOString(),
    images,
  }

  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")
  console.log(`Generated ${path.relative(rootDir, outputPath)} with ${images.length} image(s).`)
}

generateManifest().catch((error) => {
  console.error("Failed to generate advertisements manifest.")
  console.error(error)
  process.exit(1)
})

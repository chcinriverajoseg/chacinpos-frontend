import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#1D9E75"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" font-family="Arial">🛒</text>
  <text x="256" y="460" font-size="72" text-anchor="middle" font-family="Arial" fill="white" font-weight="bold">POS</text>
</svg>`

const svgBuffer = Buffer.from(svg)

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`)
  console.log(`✅ icon-${size}.png generado`)
}

console.log('🎉 Todos los iconos generados')
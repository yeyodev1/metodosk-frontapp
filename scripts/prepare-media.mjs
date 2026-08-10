#!/usr/bin/env node
/**
 * Prepara la media original para Cloudinary.
 *
 * Las fotos del shoot vienen en 6656x9984 (~66 MP, 22-38 MB c/u). Cloudinary
 * rechaza imagenes sobre 10 MB / 25 MP en el plan free, asi que hay que bajarlas
 * antes de subir. Cloudinary genera despues todas las variantes responsive.
 *
 * Uso: pnpm media:prepare
 */
import { execFile } from 'node:child_process'
import { mkdir, readdir, stat, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

const SOURCE_PHOTOS = path.join(homedir(), 'Downloads', 'fotos-metodosk')
const SOURCE_VIDEO = path.join(
  homedir(),
  'Downloads',
  'copy_97215728-95D7-4F5F-BDB8-2FA5A573BAE1.MOV',
)
const OUT_DIR = path.resolve(process.cwd(), '.media-build')
const MAX_EDGE = 2400
const QUALITY = 80

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(1)

async function preparePhotos() {
  if (!existsSync(SOURCE_PHOTOS)) {
    console.warn(`[skip] No existe ${SOURCE_PHOTOS}`)
    return []
  }

  const files = (await readdir(SOURCE_PHOTOS)).filter((f) => /\.jpe?g$/i.test(f)).sort()
  const results = []

  for (const [index, file] of files.entries()) {
    const slug = `sk-${String(index + 1).padStart(2, '0')}`
    const dest = path.join(OUT_DIR, `${slug}.jpg`)

    await copyFile(path.join(SOURCE_PHOTOS, file), dest)
    await run('sips', [
      '--resampleHeightWidthMax',
      String(MAX_EDGE),
      '--setProperty',
      'formatOptions',
      String(QUALITY),
      dest,
    ])

    const { size } = await stat(dest)
    results.push({ slug, source: file, path: dest, size })
    console.log(`  ${slug}  ${file}  ->  ${mb(size)} MB`)
  }

  return results
}

async function prepareVideo() {
  if (!existsSync(SOURCE_VIDEO)) {
    console.warn(`[skip] No existe ${SOURCE_VIDEO}`)
    return null
  }

  // El video (1080x1920, 27.7s, h264, ~51 MB) esta bajo el limite de Cloudinary,
  // se sube tal cual y Cloudinary hace el transcoding.
  const dest = path.join(OUT_DIR, 'sk-hero-video.mov')
  await copyFile(SOURCE_VIDEO, dest)
  const { size } = await stat(dest)
  console.log(`  sk-hero-video  ->  ${mb(size)} MB (sin recomprimir)`)
  return { slug: 'sk-hero-video', path: dest, size }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  console.log(`Preparando media en ${OUT_DIR}\n`)

  console.log('Fotos:')
  const photos = await preparePhotos()

  console.log('\nVideo:')
  const video = await prepareVideo()

  const total = [...photos, video].filter(Boolean).reduce((acc, item) => acc + item.size, 0)
  console.log(`\nListo: ${photos.length} fotos + ${video ? 1 : 0} video — ${mb(total)} MB total`)
  console.log('Siguiente paso: pnpm media:upload')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

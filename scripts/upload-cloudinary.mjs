#!/usr/bin/env node
/**
 * Sube la media preparada a Cloudinary (upload firmado, sin SDK) y regenera
 * src/config/media.ts con los public_id y dimensiones reales.
 *
 * Es idempotente: usa public_id estables + overwrite, asi que re-correrlo
 * reemplaza los assets en vez de duplicarlos.
 *
 * Uso: pnpm media:upload
 */
import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MEDIA_DIR = path.join(ROOT, '.media-build')
const OUTPUT = path.join(ROOT, 'src', 'config', 'media.ts')
const FOLDER = 'metodosk'

async function loadEnv() {
  const envPath = path.join(ROOT, '.env')
  if (!existsSync(envPath)) return
  const raw = await readFile(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  }
}

function signature(params, apiSecret) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return createHash('sha1').update(toSign + apiSecret).digest('hex')
}

async function upload(filePath, publicId, resourceType, credentials) {
  const { cloudName, apiKey, apiSecret } = credentials
  const timestamp = Math.floor(Date.now() / 1000)
  const signed = { folder: FOLDER, overwrite: 'true', public_id: publicId, timestamp }

  const form = new FormData()
  const bytes = await readFile(filePath)
  form.append('file', new Blob([bytes]), path.basename(filePath))
  for (const [key, value] of Object.entries(signed)) form.append(key, String(value))
  form.append('api_key', apiKey)
  form.append('signature', signature(signed, apiSecret))

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: 'POST', body: form },
  )
  const json = await response.json()
  if (!response.ok) {
    throw new Error(`${publicId}: ${json?.error?.message ?? response.statusText}`)
  }
  return json
}

function renderModule(photos, video) {
  const entries = photos
    .map(
      (p) =>
        `  { id: '${p.public_id}', width: ${p.width}, height: ${p.height}, alt: '${p.alt}' },`,
    )
    .join('\n')

  return `/**
 * Generado por scripts/upload-cloudinary.mjs — no editar a mano el bloque PHOTOS.
 * Volver a generar con: pnpm media:upload
 */
export interface CloudinaryPhoto {
  id: string
  width: number
  height: number
  alt: string
}

export const CLOUD_NAME = '${process.env.CLOUDINARY_CLOUD_NAME}'

export const PHOTOS: CloudinaryPhoto[] = [
${entries}
]

export const HERO_VIDEO = '${video?.public_id ?? ''}'

const byId = (id: string) => PHOTOS.find((photo) => photo.id === id)

/** Busca una foto por sufijo (\`sk-04\`) y cae a la primera disponible. */
export function photo(slug: string): CloudinaryPhoto {
  return byId(\`${FOLDER}/\${slug}\`) ?? PHOTOS[0]!
}
`
}

async function main() {
  await loadEnv()

  const credentials = {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  }

  if (!credentials.cloudName || !credentials.apiKey || !credentials.apiSecret) {
    throw new Error('Faltan CLOUDINARY_* en .env (ver .env.example)')
  }
  if (!existsSync(MEDIA_DIR)) {
    throw new Error('No existe .media-build — corre primero: pnpm media:prepare')
  }

  const files = (await readdir(MEDIA_DIR)).sort()
  const photoFiles = files.filter((f) => f.endsWith('.jpg'))
  const videoFile = files.find((f) => f.endsWith('.mov'))

  const photos = []
  for (const file of photoFiles) {
    const slug = path.basename(file, '.jpg')
    const result = await upload(path.join(MEDIA_DIR, file), slug, 'image', credentials)
    photos.push({ ...result, alt: 'Entrenamiento Método SK' })
    console.log(`  ✓ ${result.public_id}  ${result.width}x${result.height}`)
  }

  let video = null
  if (videoFile) {
    video = await upload(path.join(MEDIA_DIR, videoFile), 'sk-hero-video', 'video', credentials)
    console.log(`  ✓ ${video.public_id}  ${video.width}x${video.height}  ${video.duration}s`)
  }

  await writeFile(OUTPUT, renderModule(photos, video), 'utf8')
  console.log(`\nEscrito ${path.relative(ROOT, OUTPUT)} — ${photos.length} fotos${video ? ' + video' : ''}`)
}

main().catch((error) => {
  console.error(`\n✗ ${error.message}`)
  process.exit(1)
})

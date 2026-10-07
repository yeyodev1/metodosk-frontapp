/**
 * Achica la foto en el navegador antes de subirla.
 *
 * La foto tal cual sale de un iPad o un iPhone pesa varios megas, a veces en
 * HEIC, y Cloudinary la rechaza por tamaño o no la sabe transformar después
 * (queda subida pero se ve rota). Redibujada a 2000 px en JPEG pesa unos
 * cientos de KB, sube rápido con datos móviles y sirve igual para comparar.
 *
 * Si el navegador no puede leerla, se sube la original: peor eso que nada.
 */
const LADO_MAX = 2000
const CALIDAD = 0.85

function cargar(archivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen'))
    }
    img.src = url
  })
}

export async function comprimirFoto(archivo: File): Promise<Blob> {
  try {
    // <img> ya aplica la orientación EXIF: la foto no sale de lado.
    const img = await cargar(archivo)
    const escala = Math.min(1, LADO_MAX / Math.max(img.naturalWidth, img.naturalHeight))
    const ancho = Math.round(img.naturalWidth * escala)
    const alto = Math.round(img.naturalHeight * escala)

    const lienzo = document.createElement('canvas')
    lienzo.width = ancho
    lienzo.height = alto
    const ctx = lienzo.getContext('2d')
    if (!ctx) return archivo
    ctx.drawImage(img, 0, 0, ancho, alto)

    const blob = await new Promise<Blob | null>((r) => lienzo.toBlob(r, 'image/jpeg', CALIDAD))
    return blob && blob.size > 0 ? blob : archivo
  } catch {
    return archivo
  }
}

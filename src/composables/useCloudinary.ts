/**
 * Construcción de URLs de Cloudinary. Todas las imágenes de la landing pasan
 * por acá para que siempre salgan con f_auto/q_auto y en el tamaño justo.
 */
import { CLOUD_NAME } from '@/config/media'

/**
 * El cloud sale de `media.ts` y no de una variable de entorno.
 *
 * Antes mandaba `VITE_CLOUDINARY_CLOUD_NAME`, y eso rompió la portada: hay dos
 * cuentas de Cloudinary —una con las fotos del shoot, otra donde las alumnas
 * suben las suyas— y apuntar esta variable a la segunda dejó la landing entera
 * pidiendo fotos que ahí no existen, con 404 silenciosos.
 *
 * `media.ts` lo genera el mismo script que sube las fotos, así que su
 * CLOUD_NAME siempre es la cuenta donde las fotos de verdad están. No hay
 * ninguna configuración que pueda contradecirlo sin equivocarse.
 *
 * Las fotos de las alumnas no pasan por acá: sus URLs llegan ya armadas y
 * firmadas desde el backend, que es el único que tiene ese secreto.
 */
const BASE = `https://res.cloudinary.com/${CLOUD_NAME}`

export interface ImageOptions {
  /** Ancho en px. */
  width?: number
  /** Relación de aspecto, ej. '3:4'. Requiere crop de recorte. */
  ratio?: string
  /** Por defecto 'fill' con gravedad automática hacia la persona. */
  crop?: 'fill' | 'fit' | 'scale'
  /** Gravedad del recorte. 'auto' detecta el sujeto. */
  gravity?: 'auto' | 'face' | 'center'
  /**
   * Desenfoque hecho por Cloudinary (1–2000). Se usa para las capas de fondo
   * del parallax: el navegador no paga el `filter: blur()` en cada frame.
   */
  blur?: number
}

const DEFAULT_WIDTHS = [480, 768, 1080, 1440, 1920]

function transform({ width, ratio, crop = 'fill', gravity = 'auto', blur }: ImageOptions): string {
  const parts = ['f_auto', 'q_auto', 'dpr_auto']
  if (blur) parts.push(`e_blur:${Math.round(blur)}`)
  if (width) parts.push(`w_${width}`)
  if (ratio) parts.push(`ar_${ratio.replace(':', ':')}`)
  if (width || ratio) {
    parts.push(`c_${crop}`)
    if (crop === 'fill') parts.push(`g_${gravity}`)
  }
  return parts.join(',')
}

/** URL de una imagen con transformaciones. */
export function cldImage(publicId: string, options: ImageOptions = {}): string {
  return `${BASE}/image/upload/${transform(options)}/${publicId}`
}

/** srcset responsive para el mismo public_id. */
export function cldSrcset(
  publicId: string,
  options: ImageOptions = {},
  widths: number[] = DEFAULT_WIDTHS,
): string {
  return widths
    .map((width) => `${cldImage(publicId, { ...options, width })} ${width}w`)
    .join(', ')
}

/** Placeholder borroso y liviano para el fade-in. */
export function cldBlur(publicId: string): string {
  return `${BASE}/image/upload/f_auto,q_10,w_32,e_blur:400/${publicId}`
}

/**
 * Video de fondo, forzado a H.264 en MP4.
 *
 * NO usar `f_auto,vc_auto`: Cloudinary le entrega HEVC (`hvc1`) a Safari y iOS
 * no lo reproduce inline — el hero se quedaba en el poster. H.264 lo decodifica
 * por hardware cualquier iPhone.
 *
 * `ac_none` quita la pista de audio: el video va en mute igual, y sin audio
 * pesa menos y desaparece un motivo por el que iOS bloquea el autoplay.
 */
export function cldVideo(publicId: string, width = 720): string {
  return `${BASE}/video/upload/f_mp4,vc_h264,q_auto:eco,ac_none,w_${width}/${publicId}`
}

/** Frame del video como poster, para que el hero no parpadee al cargar. */
export function cldPoster(publicId: string, width = 1080): string {
  return `${BASE}/video/upload/f_auto,q_auto,so_1,w_${width}/${publicId}.jpg`
}

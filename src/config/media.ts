/**
 * Generado por scripts/upload-cloudinary.mjs — no editar a mano el bloque PHOTOS.
 * Volver a generar con: pnpm media:upload
 */
export interface CloudinaryPhoto {
  id: string
  width: number
  height: number
  alt: string
}

export const CLOUD_NAME = 'kyt3rjjz'

export const PHOTOS: CloudinaryPhoto[] = [
  { id: 'metodosk/sk-01', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-02', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-03', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-04', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-05', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-06', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-07', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-08', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-09', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-10', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-11', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-12', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-13', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-14', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-15', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-16', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-17', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-18', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-19', width: 2400, height: 1600, alt: 'Entrenamiento Método SK' },
  { id: 'metodosk/sk-20', width: 1600, height: 2400, alt: 'Entrenamiento Método SK' },
]

export const HERO_VIDEO = 'metodosk/sk-hero-video'

const byId = (id: string) => PHOTOS.find((photo) => photo.id === id)

/** Busca una foto por sufijo (`sk-04`) y cae a la primera disponible. */
export function photo(slug: string): CloudinaryPhoto {
  return byId(`metodosk/${slug}`) ?? PHOTOS[0]!
}

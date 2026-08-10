/**
 * Asignación de cada foto del shoot a su lugar en la página, con su alt real.
 * Se escribe a mano — `media.ts` lo regenera el script de upload y se sobrescribe.
 */
import { photo, type CloudinaryPhoto } from './media'

export interface Photo extends CloudinaryPhoto {
  alt: string
}

const withAlt = (slug: string, alt: string): Photo => ({ ...photo(slug), alt })

/** Foto por rol dentro de la landing. */
export const PHOTO = {
  /** Fallback del hero cuando no se puede reproducir video. */
  heroFallback: withAlt('sk-04', 'Dos mujeres entrenando con el Método SK'),
  /** Sección "qué es el Método SK". */
  promise: withAlt('sk-13', 'Scarlet Córdova, entrenadora del Método SK'),
  /** Reto SK Recomposición. */
  recomposicion: withAlt('sk-07', 'Abdomen definido tras el reto de recomposición'),
  /** Reto SK Volumen — el superávit se construye en la cocina, no solo entrenando. */
  volumen: withAlt('sk-06', 'Karen López con un batido del plan de volumen'),
  /** Bloque de entrenamiento. */
  training: withAlt('sk-08', 'Sentadilla con mancuerna durante la rutina'),
  /** Bloque de nutrición. */
  nutrition: withAlt('sk-05', 'Karen López, nutricionista del Método SK'),
  /** Guía impresa del Método SK. */
  guide: withAlt('sk-03', 'Scarlet Córdova y Karen López con la guía impresa del Método SK'),
  /** Cierre / último CTA. */
  finalCta: withAlt('sk-01', 'Mujer entrenando sobre fondo oscuro'),
} satisfies Record<string, Photo>

/** Galería de comunidad — el resto de la sesión. */
export const GALLERY: Photo[] = [
  withAlt('sk-19', 'Dos alumnas riendo después de entrenar'),
  withAlt('sk-12', 'Dos alumnas del Método SK'),
  withAlt('sk-18', 'Dos alumnas posando tras la rutina'),
  withAlt('sk-15', 'Alumna atándose las zapatillas antes de entrenar'),
  withAlt('sk-20', 'Alumnas del Método SK sonriendo'),
  withAlt('sk-11', 'Resultados del reto de 3 meses'),
  withAlt('sk-17', 'Alumna del Método SK en ropa deportiva'),
  withAlt('sk-10', 'Alumna del Método SK sentada'),
  withAlt('sk-16', 'Perfil de alumna del Método SK'),
  withAlt('sk-02', 'La guía del Método SK en manos de las alumnas'),
]

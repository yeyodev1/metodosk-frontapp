import type { TipoPost, TipoReaccion } from '@/services/communityService'

/**
 * Los textos de la comunidad.
 *
 * Los puntos, los niveles y las insignias no están acá: los manda el servidor,
 * que es el que cuenta. Acá solo va cómo se nombra y se pinta cada cosa.
 */

export const TIPOS: Array<{
  id: TipoPost
  nombre: string
  emoji: string
  /** Lo que se le sugiere escribir al elegirlo. */
  placeholder: string
}> = [
  {
    id: 'logro',
    nombre: 'Logro',
    emoji: '🏆',
    placeholder: '¿Qué lograste? Una clase completa, una talla menos, más peso en la sentadilla…',
  },
  {
    id: 'motivacion',
    nombre: 'Motivación',
    emoji: '💪',
    placeholder: 'Cuéntale a las demás qué te mantiene firme esta semana…',
  },
  {
    id: 'receta',
    nombre: 'Receta',
    emoji: '🥗',
    placeholder: '¿Qué cocinaste del menú? Comparte cómo te quedó…',
  },
  {
    id: 'pregunta',
    nombre: 'Pregunta',
    emoji: '❓',
    placeholder: 'Pregunta lo que sea: alguien del reto o del equipo te responde…',
  },
  {
    id: 'general',
    nombre: 'Charla',
    emoji: '💬',
    placeholder: 'Preséntate o cuenta cómo va tu semana…',
  },
]

export const tipoDe = (id: TipoPost) => TIPOS.find((t) => t.id === id) ?? TIPOS[TIPOS.length - 1]!

export const REACCIONES: Array<{ id: TipoReaccion; emoji: string; nombre: string }> = [
  { id: 'fuerza', emoji: '💪', nombre: 'Fuerza' },
  { id: 'fuego', emoji: '🔥', nombre: 'Fuego' },
  { id: 'aplauso', emoji: '👏', nombre: 'Aplauso' },
]

export const COMUNIDAD = {
  eyebrow: 'Entre nosotras',
  titulo: 'La comunidad',
  sub: 'Comparte tus logros, tus recetas y tus dudas. Cada clase que terminas, cada foto de avance y cada publicación te suman puntos: sube de nivel, gana insignias y aparece entre las destacadas del mes.',
  vacio: {
    titulo: 'Sé la primera en compartir',
    texto: 'Cuenta tu primer logro del reto —por pequeño que sea— y gana tu insignia «¡Lo logré!».',
  },
}

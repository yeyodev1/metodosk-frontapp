/**
 * Utilidades del panel de cupones: opciones de duración, cálculo del
 * vencimiento y textos de estado. Sin dependencias de Vue para que el
 * formulario y la tarjeta las compartan.
 */
import type { EstadoCupon } from '@/services/cuponService'

const ZONA = 'America/Guayaquil'

export const PORCENTAJES = [10, 15, 20, 25, 30, 50] as const

export interface Duracion {
  id: string
  label: string
  /** Días de vigencia; null = sin vencimiento. */
  dias: number | null
}

export const DURACIONES: Duracion[] = [
  { id: '24h', label: '24 horas', dias: 1 },
  { id: '3d', label: '3 días', dias: 3 },
  { id: '7d', label: '7 días', dias: 7 },
  { id: '15d', label: '15 días', dias: 15 },
  { id: '30d', label: '30 días', dias: 30 },
  { id: 'nunca', label: 'Sin vencimiento', dias: null },
]

/** Fecha (AAAA-MM-DD) en Ecuador de un instante. */
function diaEnEcuador(fecha: Date): string {
  return fecha.toLocaleDateString('en-CA', { timeZone: ZONA })
}

/**
 * Cuándo vence un cupón que dura `dias` desde ahora.
 *
 * 24 horas son 24 horas exactas: es una urgencia y así se anuncia. El resto
 * cierra a las 23:59 de Ecuador del último día, que es como lo entiende una
 * persona — "7 días" no termina a las 10:43 de la mañana.
 */
export function vencimientoDe(dias: number, desde = new Date()): Date {
  if (dias === 1) return new Date(desde.getTime() + 24 * 60 * 60 * 1000)
  const ultimo = new Date(desde.getTime() + dias * 24 * 60 * 60 * 1000)
  return new Date(`${diaEnEcuador(ultimo)}T23:59:59-05:00`)
}

export function fechaLarga(iso: string | Date): string {
  return new Date(iso).toLocaleString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA,
  })
}

/** "en 3 días", "en 5 horas", "hace 2 días". */
export function relativo(iso: string, ahora = Date.now()): string {
  const diff = new Date(iso).getTime() - ahora
  const abs = Math.abs(diff)
  const horas = Math.round(abs / 3_600_000)
  const dias = Math.round(abs / 86_400_000)
  const cuanto =
    horas < 1 ? 'menos de una hora' : horas < 48 ? `${horas} ${horas === 1 ? 'hora' : 'horas'}` : `${dias} días`
  return diff >= 0 ? `en ${cuanto}` : `hace ${cuanto}`
}

export const ESTADOS: Record<EstadoCupon, { label: string; tono: 'ok' | 'info' | 'warn' | 'off' }> = {
  activo: { label: 'Activo', tono: 'ok' },
  programado: { label: 'Programado', tono: 'info' },
  agotado: { label: 'Agotado', tono: 'warn' },
  vencido: { label: 'Vencido', tono: 'off' },
  pausado: { label: 'Pausado', tono: 'off' },
}

export const CODIGO_VALIDO = /^[A-Za-z0-9_-]{3,32}$/

export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    return false
  }
}

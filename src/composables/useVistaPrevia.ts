import { computed, ref } from 'vue'
import { CHALLENGES } from '@/config/site'
import { SEMANAS } from '@/config/academy'

/**
 * Qué alumna está simulando la administración: su reto y su semana.
 *
 * La cuenta de administración no compró nada, así que "verla como alumna"
 * necesita decir cuál: una de Recomposición en su semana 1 ve el bloque 2 con
 * candado; una de Volumen en su semana 6 lo ve abierto y con el menú del mes 2.
 * Antes la pantalla mezclaba las dos cosas —el selector decía un reto y las
 * tarjetas decían "el tuyo" en los dos— y no había forma de revisar qué ve
 * una alumna nueva.
 *
 * Vive en el módulo y no en cada pantalla: se elige una vez en la franja de
 * arriba y Mi reto y Tu guía responden igual.
 */
const reto = ref(CHALLENGES[0]!.name)
const semana = ref(1)

/** El bloque N se abre en la semana (N - 1) * 4 + 1: el 2 en la semana 5. */
export function bloqueDeSemana(n: number): number {
  return Math.min(Math.ceil(n / 4), 3)
}

export const OPCIONES_SEMANA = Array.from({ length: SEMANAS }, (_, i) => {
  const n = i + 1
  const bloque = bloqueDeSemana(n)
  return {
    value: String(n),
    label: `Semana ${n}`,
    // La semana en que se abre un bloque se dice: es la que se quiere revisar.
    hint: n % 4 === 1 ? `Empieza el bloque ${bloque}` : `Bloque ${bloque}`,
    short: `Semana ${n} · Bloque ${bloque}`,
  }
})

export function useVistaPrevia() {
  const retoId = computed(() => CHALLENGES.find((c) => c.name === reto.value)?.id ?? null)
  const bloque = computed(() => bloqueDeSemana(semana.value))
  return { reto, retoId, semana, bloque }
}

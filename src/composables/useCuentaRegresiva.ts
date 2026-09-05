/**
 * Cuánto falta para que cierre la pre-venta, en texto.
 *
 * Se recalcula solo, cada minuto. No baja a segundos a propósito: un reloj
 * corriendo hacia atrás en el hero es un truco de infoproducto, y lo que hace
 * falta acá es que se entienda el corte, no presionar con un cronómetro.
 */
import { computed, onUnmounted, ref } from 'vue'
import { PRESALE_DEADLINE } from '@/config/payment'

const UN_MINUTO = 60_000

export function useCuentaRegresiva(limiteIso: string = PRESALE_DEADLINE) {
  const limite = new Date(limiteIso)
  const ahora = ref(new Date())

  const reloj = setInterval(() => {
    ahora.value = new Date()
  }, UN_MINUTO)
  onUnmounted(() => clearInterval(reloj))

  /** Ya pasó el corte: quien mire después del 14 no ve una promesa vencida. */
  const cerrada = computed(() => ahora.value >= limite)

  const horasRestantes = computed(() =>
    Math.max(0, Math.ceil((limite.getTime() - ahora.value.getTime()) / 3_600_000)),
  )

  const diasRestantes = computed(() => Math.ceil(horasRestantes.value / 24))

  /**
   * El texto cambia de forma según lo que queda, porque "quedan 216 horas" no
   * apura a nadie y "quedan 9 días" el último día es mentira.
   */
  const texto = computed(() => {
    if (cerrada.value) return ''
    if (horasRestantes.value <= 1) return 'Última hora de pre-venta'
    if (horasRestantes.value <= 24) return `Quedan ${horasRestantes.value} horas de pre-venta`
    if (diasRestantes.value === 1) return 'Último día de pre-venta'
    return `Quedan ${diasRestantes.value} días de pre-venta`
  })

  return { cerrada, texto, diasRestantes, horasRestantes }
}

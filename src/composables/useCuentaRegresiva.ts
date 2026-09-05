/**
 * Cuánto falta para que cierre la pre-venta.
 *
 * Baja cada segundo. Ver el número moverse es la mitad del trabajo: una fecha
 * quieta se lee y se olvida, un reloj corriendo se siente.
 */
import { computed, onUnmounted, ref } from 'vue'
import { PRESALE_DEADLINE } from '@/config/payment'

const UN_SEGUNDO = 1_000

export function useCuentaRegresiva(limiteIso: string = PRESALE_DEADLINE) {
  /**
   * Safari parsea bien el ISO con desfase (`-05:00`), que es justo por lo que
   * la constante lo lleva escrito: sin él cada navegador lo resolvería en su
   * propia zona y el corte sería distinto para cada compradora.
   */
  const limite = new Date(limiteIso)
  const ahora = ref(Date.now())

  const reloj = setInterval(() => {
    ahora.value = Date.now()
  }, UN_SEGUNDO)
  onUnmounted(() => clearInterval(reloj))

  const restanteMs = computed(() => Math.max(0, limite.getTime() - ahora.value))

  /** Pasado el corte: nadie debe ver una pre-venta vencida anunciándose. */
  const cerrada = computed(() => restanteMs.value <= 0)

  const dias = computed(() => Math.floor(restanteMs.value / 86_400_000))
  const horas = computed(() => Math.floor(restanteMs.value / 3_600_000) % 24)
  const minutos = computed(() => Math.floor(restanteMs.value / 60_000) % 60)
  const segundos = computed(() => Math.floor(restanteMs.value / 1_000) % 60)

  /** Dos dígitos siempre: sin esto el ancho baila a cada tic. */
  const dosDigitos = (n: number) => String(n).padStart(2, '0')

  /**
   * Las piezas que se pintan.
   *
   * Los días desaparecen el último día en vez de mostrar un "0": llegado ese
   * punto lo que aprieta son las horas, y un cero grande resta en vez de sumar.
   */
  const piezas = computed(() => {
    const base = [
      { valor: dosDigitos(horas.value), etiqueta: 'h' },
      { valor: dosDigitos(minutos.value), etiqueta: 'm' },
      { valor: dosDigitos(segundos.value), etiqueta: 's' },
    ]
    return dias.value > 0
      ? [{ valor: String(dias.value), etiqueta: dias.value === 1 ? 'día' : 'días' }, ...base]
      : base
  })

  return { cerrada, piezas, dias, horas, minutos, segundos }
}

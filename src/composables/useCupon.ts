/**
 * El cupón de descuento aplicado, compartido por toda la landing.
 *
 * Llega de dos formas: por el link (`/?cupon=PrimerMesSk1000`), que es como lo
 * reparte la administración en anuncios y mensajes, o escrito a mano en el
 * checkout. En los dos casos lo valida el backend: acá solo se guarda lo que
 * él respondió, para pintarlo.
 *
 * Se recuerda en localStorage porque quien entra por el link de una historia
 * de Instagram suele volver horas después, desde otro clic, sin el `?cupon=`.
 * Al volver se revalida: si venció entretanto, desaparece sin cobrarle nada
 * distinto a lo que ve.
 *
 * Usa `fetch` y no el servicio de axios: la landing no carga axios (ver
 * apiUrl.ts) y esto corre en la primera pantalla.
 */
import { computed, ref } from 'vue'
import { resolveApiBaseUrl } from '@/services/apiUrl'
import { PRICES } from '@/config/payment'

export interface Cupon {
  code: string
  percent: number
  /** ISO; null = sin vencimiento. */
  endsAt: string | null
  baseCents: number
  finalCents: number
}

const KEY = 'metodosk:cupon'
export const PARAM = 'cupon'

const cupon = ref<Cupon | null>(null)
const cargando = ref(false)
const error = ref('')

function recordar(code: string | null) {
  try {
    if (code) localStorage.setItem(KEY, code)
    else localStorage.removeItem(KEY)
  } catch {
    // Modo privado: el cupón dura lo que dure la pestaña.
  }
}

function recordado(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

async function consultar(code: string): Promise<Cupon> {
  const response = await fetch(`${resolveApiBaseUrl()}/payments/cupon/${encodeURIComponent(code)}`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.message || 'No pudimos validar el cupón')
  return data as Cupon
}

/** Valida y aplica un código. Devuelve true si quedó aplicado. */
async function aplicar(code: string, { silencioso = false } = {}): Promise<boolean> {
  const limpio = code.trim()
  if (!limpio) {
    error.value = 'Escribe tu cupón'
    return false
  }

  cargando.value = true
  error.value = ''
  try {
    cupon.value = await consultar(limpio)
    recordar(cupon.value.code)
    return true
  } catch (e) {
    // Un cupón recordado que venció se olvida sin hacer ruido; uno escrito
    // a mano sí explica por qué no entró.
    if (!silencioso) error.value = e instanceof Error ? e.message : 'No pudimos validar el cupón'
    if (silencioso) recordar(null)
    return false
  } finally {
    cargando.value = false
  }
}

function quitar() {
  cupon.value = null
  error.value = ''
  recordar(null)
}

let iniciado = false

/**
 * Lee el cupón del link o el que quedó recordado. Se llama una vez al
 * arrancar la app.
 */
export function iniciarCupon() {
  if (iniciado || typeof window === 'undefined') return
  iniciado = true

  const desdeLink = new URLSearchParams(window.location.search).get(PARAM)
  const code = desdeLink || recordado()
  if (code) void aplicar(code, { silencioso: !desdeLink })
}

/** Link de compra con el cupón ya puesto. */
export function linkConCupon(code: string, origin = window.location.origin): string {
  return `${origin}/?${PARAM}=${encodeURIComponent(code)}`
}

export function useCupon() {
  /** Lo que se cobra hoy, con o sin cupón. */
  const precio = computed(() => cupon.value?.finalCents ?? PRICES.regular)
  const ahorro = computed(() => (cupon.value ? cupon.value.baseCents - cupon.value.finalCents : 0))

  return { cupon, cargando, error, precio, ahorro, aplicar, quitar }
}

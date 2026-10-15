/**
 * Estado compartido de la compra: qué reto se eligió y con qué datos abrir
 * el formulario.
 *
 * La compra es una página propia (`/comprar`), no un modal: un modal encima
 * de la landing se cierra con un clic fuera, no tiene URL que compartir y en
 * el navegador de Instagram el botón "atrás" saca de la página entera. Todos
 * los botones de compra pasan por `open()`, que navega a esa página.
 */
import { computed, ref } from 'vue'
import { CHALLENGES, type Challenge } from '@/config/site'

const selectedId = ref<Challenge['id'] | null>(null)

/**
 * Datos con los que abrir el formulario ya rellenado.
 *
 * Los pone quien abre la compra desde dentro de la app, donde sí se conoce a
 * la alumna. El formulario no consulta la sesión por su cuenta: importar el
 * store desde acá arrastraría axios hasta la landing, que no lo necesita.
 */
const prefill = ref<{ name?: string; email?: string } | null>(null)

export const RUTA_COMPRA = '/comprar'

export function useCheckout() {
  /** El reto elegido, o null mientras no haya elección. */
  const selected = computed<Challenge | null>(
    () => CHALLENGES.find((challenge) => challenge.id === selectedId.value) ?? null,
  )

  function select(id: Challenge['id'] | null) {
    selectedId.value = id
  }

  /**
   * Lleva a la página de compra. Con `id` el reto llega elegido; sin él, la
   * página pregunta primero: nadie compra un reto que no eligió.
   */
  async function open(id?: Challenge['id'], datos?: { name?: string; email?: string }) {
    selectedId.value = id ?? (CHALLENGES.length === 1 ? CHALLENGES[0]!.id : null)
    prefill.value = datos ?? null

    // El router se importa acá dentro para no crear un ciclo de módulos.
    const { default: router } = await import('@/router')
    router.push({ path: RUTA_COMPRA, query: id ? { reto: id } : {} })
  }

  return { selectedId, selected, prefill, select, open }
}

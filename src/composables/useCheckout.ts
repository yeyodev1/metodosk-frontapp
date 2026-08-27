/**
 * Estado compartido del checkout: qué reto se eligió y si el modal está abierto.
 * Es estado de módulo, así cualquier sección puede abrir el mismo checkout.
 */
import { computed, ref } from 'vue'
import { CHALLENGES, type Challenge } from '@/config/site'

const isOpen = ref(false)
const selectedId = ref<Challenge['id'] | null>(null)

/**
 * Datos con los que abrir el formulario ya rellenado.
 *
 * Los pone quien abre el checkout desde dentro de la app, donde sí se conoce a
 * la alumna. El formulario no consulta la sesión por su cuenta: importar el
 * store desde acá arrastraría axios hasta la landing, que no lo necesita.
 */
const prefill = ref<{ name?: string; email?: string } | null>(null)

export function useCheckout() {
  /** El reto elegido, o el primero como respaldo mientras no hay elección. */
  const selected = computed<Challenge>(
    () => CHALLENGES.find((challenge) => challenge.id === selectedId.value) ?? CHALLENGES[0]!,
  )

  /**
   * true cuando se abrió el checkout sin decir qué reto.
   * En ese caso el modal pregunta primero, en vez de asumir uno.
   */
  const needsChoice = computed(() => selectedId.value === null && CHALLENGES.length > 1)

  function select(id: Challenge['id']) {
    selectedId.value = id
  }

  function open(id?: Challenge['id'], datos?: { name?: string; email?: string }) {
    // Sin id explícito volvemos a preguntar: nadie compra un reto que no eligió.
    selectedId.value = id ?? (CHALLENGES.length === 1 ? CHALLENGES[0]!.id : null)
    prefill.value = datos ?? null
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, selectedId, selected, needsChoice, prefill, select, open, close }
}

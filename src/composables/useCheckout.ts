/**
 * Estado compartido del checkout: qué reto se eligió y si el modal está abierto.
 * Es estado de módulo, así cualquier sección puede abrir el mismo checkout.
 */
import { computed, ref } from 'vue'
import { CHALLENGES, type Challenge } from '@/config/site'

const isOpen = ref(false)
const selectedId = ref<Challenge['id'] | null>(null)

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

  function open(id?: Challenge['id']) {
    // Sin id explícito volvemos a preguntar: nadie compra un reto que no eligió.
    selectedId.value = id ?? (CHALLENGES.length === 1 ? CHALLENGES[0]!.id : null)
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, selectedId, selected, needsChoice, select, open, close }
}

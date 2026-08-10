/**
 * Estado compartido del checkout: qué reto se eligió y si el modal está abierto.
 * Es estado de módulo, así cualquier sección puede abrir el mismo checkout.
 */
import { computed, ref } from 'vue'
import { CHALLENGES, type Challenge } from '@/config/site'

const isOpen = ref(false)
const selectedId = ref<Challenge['id']>(CHALLENGES[0]!.id)

export function useCheckout() {
  const selected = computed<Challenge>(
    () => CHALLENGES.find((challenge) => challenge.id === selectedId.value) ?? CHALLENGES[0]!,
  )

  function select(id: Challenge['id']) {
    selectedId.value = id
  }

  function open(id?: Challenge['id']) {
    if (id) select(id)
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  return { isOpen, selectedId, selected, select, open, close }
}

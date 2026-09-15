import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/**
 * Pantalla completa y ventana flotante del reproductor.
 *
 * Cada navegador lo pide distinto: el estándar, el prefijo de Safari de
 * escritorio, y el iPhone, que solo deja poner en pantalla completa el
 * `<video>` mismo y no la caja con nuestros controles.
 */
type ConWebkit = { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void }

export function usePantallaCompleta(caja: Ref<HTMLElement | null>, video: Ref<HTMLVideoElement | null>) {
  const completa = ref(false)
  const hayPip = typeof document !== 'undefined' && Boolean(document.pictureInPictureEnabled)

  function pantalla() {
    const doc = document as Document & ConWebkit
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {})
      else doc.webkitExitFullscreen?.()
      return
    }
    const c = caja.value as (HTMLElement & { webkitRequestFullscreen?: () => void }) | null
    if (c?.requestFullscreen) {
      c.requestFullscreen()
        // En el teléfono, una clase se ve acostada.
        .then(() => (screen.orientation as { lock?: (o: string) => Promise<void> }).lock?.('landscape'))
        .catch(() => {})
    } else if (c?.webkitRequestFullscreen) {
      c.webkitRequestFullscreen()
    } else {
      ;(video.value as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.()
    }
  }

  function alCambiar() {
    const doc = document as Document & ConWebkit
    completa.value = Boolean(document.fullscreenElement || doc.webkitFullscreenElement)
  }

  async function pip() {
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await video.value?.requestPictureInPicture()
    } catch {
      // Hay navegadores que lo anuncian y luego no lo dejan.
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', alCambiar)
    document.addEventListener('webkitfullscreenchange', alCambiar)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', alCambiar)
    document.removeEventListener('webkitfullscreenchange', alCambiar)
  })

  return { completa, hayPip, pantalla, pip }
}

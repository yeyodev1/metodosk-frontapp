import { onBeforeUnmount, ref } from 'vue'
import progressService from '@/services/progressService'

/**
 * Sigue el avance de un video de Bunny y lo guarda.
 *
 * El reproductor de Bunny habla el protocolo player.js por postMessage, así
 * que se puede escuchar `timeupdate` sin traer su librería. Pero no se
 * confía solo en eso: hay bloqueadores y navegadores que no dejan pasar los
 * mensajes entre marcos, y la alumna no tiene por qué enterarse de eso.
 *
 * Por eso el avance también se guarda al cerrar, y siempre existe el botón de
 * marcar la clase como vista a mano.
 *
 * Se guarda cada 15 segundos, no en cada latido: `timeupdate` dispara unas
 * cuatro veces por segundo, y eso serían miles de escrituras por clase.
 */
const CADA = 15_000

export function useVideoProgress() {
  const segundos = ref(0)
  const duracion = ref<number | null>(null)
  const terminado = ref(false)

  let courseId = ''
  let lessonId = ''
  let marco: HTMLIFrameElement | null = null
  let ultimoGuardado = 0
  let reloj: ReturnType<typeof setInterval> | null = null

  async function guardar(completado = false) {
    if (!courseId || !lessonId) return
    if (!completado && segundos.value <= ultimoGuardado) return

    ultimoGuardado = segundos.value
    try {
      await progressService.guardar({
        courseId,
        lessonId,
        seconds: Math.floor(segundos.value),
        duration: duracion.value,
        completed: completado || undefined,
      })
    } catch {
      // Perder un latido de avance no vale interrumpir la clase.
    }
  }

  function pedir(metodo: string, valor?: string) {
    marco?.contentWindow?.postMessage(
      JSON.stringify({ context: 'player.js', version: '0.0.11', method: metodo, value: valor }),
      '*',
    )
  }

  function escuchar(evento: MessageEvent) {
    if (typeof evento.data !== 'string') return
    let mensaje: { context?: string; event?: string; value?: { seconds?: number; duration?: number } }
    try {
      mensaje = JSON.parse(evento.data)
    } catch {
      return
    }
    if (mensaje.context !== 'player.js') return

    if (mensaje.event === 'ready') {
      pedir('addEventListener', 'timeupdate')
      pedir('addEventListener', 'ended')
      return
    }

    if (mensaje.event === 'timeupdate' && mensaje.value) {
      segundos.value = mensaje.value.seconds ?? segundos.value
      duracion.value = mensaje.value.duration ?? duracion.value
      return
    }

    if (mensaje.event === 'ended') {
      terminado.value = true
      guardar(true)
    }
  }

  /** Empieza a seguir un video. `iframe` es el marco ya montado. */
  function seguir(iframe: HTMLIFrameElement | null, curso: string, leccion: string, desde = 0) {
    marco = iframe
    courseId = curso
    lessonId = leccion
    segundos.value = desde
    ultimoGuardado = desde
    terminado.value = false

    window.addEventListener('message', escuchar)
    reloj = setInterval(() => guardar(), CADA)
  }

  /** Al cerrar se guarda lo último: es el momento en que más se pierde. */
  function soltar() {
    window.removeEventListener('message', escuchar)
    if (reloj) clearInterval(reloj)
    reloj = null
    guardar()
    marco = null
  }

  onBeforeUnmount(soltar)

  return { segundos, duracion, terminado, seguir, soltar, guardar }
}

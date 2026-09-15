import { onBeforeUnmount, ref, shallowRef, type Ref } from 'vue'
import type Hls from 'hls.js'

/**
 * El motor del reproductor propio: un `<video>` con HLS.
 *
 * Safari y el iPhone reproducen HLS de fábrica; el resto necesita hls.js, que
 * se carga recién cuando hace falta para no engordar la academia.
 *
 * Si algo sale mal sin arreglo (red caída del todo, el CDN niega el acceso),
 * `fallo` se enciende y la vista vuelve al reproductor de Bunny: una clase que
 * no se ve es peor que una barra de controles fea.
 */
export type Calidad = { indice: number; alto: number }

export function useHlsPlayer(video: Ref<HTMLVideoElement | null>) {
  const listo = ref(false)
  const fallo = ref(false)
  const calidades = ref<Calidad[]>([])
  /** -1 es automática, como en YouTube. */
  const calidad = ref(-1)
  const hls = shallowRef<Hls | null>(null)

  async function cargar(url: string, desde = 0) {
    const el = video.value
    if (!el) return
    destruir()
    listo.value = false
    fallo.value = false
    calidades.value = []
    calidad.value = -1

    const empezar = () => {
      // Retoma donde se quedó, salvo que ya la hubiera terminado casi entera.
      if (desde > 5 && (!el.duration || desde < el.duration - 10)) el.currentTime = desde
      listo.value = true
    }

    const { default: HlsJs } = await import('hls.js')
    if (HlsJs.isSupported()) {
      const h = new HlsJs({ startPosition: desde > 5 ? desde : -1, capLevelToPlayerSize: true })
      hls.value = h
      h.on(HlsJs.Events.MANIFEST_PARSED, () => {
        calidades.value = h.levels
          .map((l, indice) => ({ indice, alto: l.height }))
          .sort((a, b) => b.alto - a.alto)
        listo.value = true
      })
      h.on(HlsJs.Events.ERROR, (_e, data) => {
        if (!data.fatal) return
        if (data.type === HlsJs.ErrorTypes.MEDIA_ERROR) h.recoverMediaError()
        else fallo.value = true
      })
      h.loadSource(url)
      h.attachMedia(el)
    } else if (el.canPlayType('application/vnd.apple.mpegurl')) {
      el.src = url
      el.addEventListener('loadedmetadata', empezar, { once: true })
      el.addEventListener('error', () => (fallo.value = true), { once: true })
    } else {
      fallo.value = true
    }
  }

  function elegirCalidad(indice: number) {
    calidad.value = indice
    if (hls.value) hls.value.currentLevel = indice
  }

  function destruir() {
    hls.value?.destroy()
    hls.value = null
  }

  onBeforeUnmount(destruir)

  return { listo, fallo, calidades, calidad, cargar, elegirCalidad, destruir }
}

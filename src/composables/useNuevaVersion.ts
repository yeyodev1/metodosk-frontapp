import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * ¿Salió una versión nueva mientras ella tenía la app abierta?
 *
 * Una alumna deja la pestaña abierta días enteros. Cuando publicamos algo,
 * sigue con el código viejo hasta que recarga a mano — y eso no se le ocurre
 * a nadie: lo que ve es que "no le aparece" lo que las demás ya tienen. Pasó
 * hoy varias veces.
 *
 * Se detecta comparando el bundle que está corriendo con el que sirve el
 * servidor ahora. Sin service worker ni websocket: una petición minúscula al
 * index, al volver a la pestaña y cada pocos minutos. Y no se recarga sola
 * —podría estar escribiendo en el muro o a medio video— sino que se avisa y
 * ella decide.
 */
const CADA = 5 * 60 * 1000

/** El bundle con el que arrancó esta pestaña. */
function versionActual(): string | null {
  const script = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/"]')
  return script?.src.split('/').pop() ?? null
}

async function versionPublicada(): Promise<string | null> {
  try {
    const r = await fetch(`/?v=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) return null
    const html = await r.text()
    return html.match(/assets\/(index-[A-Za-z0-9_-]+\.js)/)?.[1] ?? null
  } catch {
    // Sin conexión no hay nada que avisar: se reintenta en la próxima vuelta.
    return null
  }
}

export function useNuevaVersion() {
  const hayNueva = ref(false)
  const mia = versionActual()
  let reloj: ReturnType<typeof setInterval> | null = null

  async function revisar() {
    if (hayNueva.value || !mia) return
    const publicada = await versionPublicada()
    if (publicada && publicada !== mia) hayNueva.value = true
  }

  function alVolver() {
    if (document.visibilityState === 'visible') revisar()
  }

  function actualizar() {
    window.location.reload()
  }

  onMounted(() => {
    revisar()
    reloj = setInterval(revisar, CADA)
    document.addEventListener('visibilitychange', alVolver)
  })

  onBeforeUnmount(() => {
    if (reloj) clearInterval(reloj)
    document.removeEventListener('visibilitychange', alVolver)
  })

  return { hayNueva, actualizar }
}

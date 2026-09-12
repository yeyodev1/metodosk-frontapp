import { computed, ref } from 'vue'
import guiaService, { type Guia } from '@/services/guiaService'

/**
 * La guía, cargada una sola vez para todas sus rutas.
 *
 * El estado vive en el módulo y no en cada vista: la guía se partió en ocho
 * pantallas y pedirla de nuevo en cada una haría cuatro llamadas para leer el
 * menú y volver. Se trae al entrar y las rutas hijas leen de acá.
 */
const guias = ref<Guia[]>([])
const cargando = ref(false)
const error = ref('')
const elegida = ref(0)
let pedida = false

export function useGuia() {
  const guia = computed<Guia | null>(() => guias.value[elegida.value] ?? null)

  async function cargar(forzar = false) {
    if (pedida && !forzar) return
    pedida = true
    cargando.value = true
    error.value = ''
    try {
      guias.value = await guiaService.mias()
    } catch (e: unknown) {
      error.value = (e as { message?: string }).message || 'No pudimos abrir tu guía.'
      pedida = false
    } finally {
      cargando.value = false
    }
  }

  return { guias, guia, elegida, cargando, error, cargar }
}

/**
 * La foto del plato de cada día.
 *
 * Viven en la cuenta de Cloudinary de las alumnas, que no es la misma del
 * shoot: `media.ts` apunta a la de las fotos de marca y esta es la otra. Por
 * eso la URL se arma acá y no con `CldImage`.
 *
 * Salieron del PDF de Karen, una por día. Las del día 4 y 7 traen marca de
 * agua de banco de imágenes; venían así en el original.
 */
const CLOUD_ALUMNAS = 'kr8lmvcf'

export function fotoDelDia(numero: number, ancho = 900): string {
  return `https://res.cloudinary.com/${CLOUD_ALUMNAS}/image/upload/c_fill,g_auto,w_${ancho},q_auto,f_auto/metodosk/guias/platos/dia-${numero}`
}

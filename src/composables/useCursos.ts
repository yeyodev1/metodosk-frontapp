import { computed, ref } from 'vue'
import courseService, { type CursoAlumna } from '@/services/courseService'
import progressService, { type MiAvance } from '@/services/progressService'
import { useSessionStore } from '@/stores/session'
import { useVistaPrevia } from '@/composables/useVistaPrevia'

/**
 * Los cursos de la alumna y su avance, compartidos entre Mi reto y la página
 * de cada clase.
 *
 * Viven en el módulo: entrar a una clase y volver no vuelve a pedir la lista,
 * y la barra de avance de Mi reto ya trae lo que se marcó dentro de la clase.
 */
const cursos = ref<CursoAlumna[]>([])
const avance = ref<MiAvance | null>(null)
const cargando = ref(false)
const error = ref('')
let pedidos = false

export function useCursos() {
  const session = useSessionStore()
  const vista = useVistaPrevia()

  /**
   * Los cursos que se pintan.
   *
   * A la administración el servidor le manda todo abierto y de los dos retos.
   * Para que la vista previa diga la verdad se filtra por el reto simulado, y
   * lo que esa alumna todavía no tiene se cierra igual que se le cierra a ella:
   * con candado y "se abre en tu semana 5".
   */
  const visibles = computed<CursoAlumna[]>(() => {
    if (!session.isAdmin) return cursos.value
    const retoId = vista.retoId.value
    return cursos.value
      .filter((c) => !retoId || c.challenge === 'ambas' || c.challenge === retoId)
      .map((c) =>
        c.estado === 'abierto' && !c.enlace && c.unlockMonth > vista.bloque.value
          ? { ...c, estado: 'cerrado' as const, abreEl: null }
          : c,
      )
  })

  /** `silencioso`: al volver a la pestaña se refresca sin mostrar "cargando". */
  async function cargar(silencioso = false) {
    if (!silencioso) cargando.value = true
    error.value = ''
    try {
      // El servidor decide el bloque desde la compra; el número ya no se lee.
      cursos.value = await courseService.mios(1)
      pedidos = true
    } catch (e: unknown) {
      error.value = (e as { message?: string }).message ?? 'No pudimos cargar tu reto'
    } finally {
      cargando.value = false
    }
  }

  /** Solo la primera vez: la lista ya está si se viene de otra pantalla. */
  async function asegurar() {
    if (!pedidos) await Promise.all([cargar(), cargarAvance()])
  }

  async function cargarAvance() {
    try {
      avance.value = await progressService.mio()
    } catch {
      // Sin avance se ve igual, solo sin barras.
    }
  }

  function avanceDe(courseId: string) {
    return avance.value?.cursos.find((c) => c.courseId === courseId) ?? null
  }

  return { cursos, visibles, avance, cargando, error, cargar, asegurar, cargarAvance, avanceDe }
}

/** Cuánto dura, en minutos redondos. */
export function duracion(segundos: number | null | undefined) {
  if (!segundos) return null
  return `${Math.round(segundos / 60)} min`
}

/**
 * El bloque N se abre en la semana (N - 1) * 4 + 1, contada desde su compra.
 * Se dice en semanas porque es como ella cuenta su reto.
 */
export function cuandoAbre(curso: CursoAlumna) {
  if (curso.estado === 'cerrado') {
    const semana = `Se abre en tu semana ${(curso.unlockMonth - 1) * 4 + 1}`
    if (!curso.abreEl) return semana
    const fecha = new Date(curso.abreEl).toLocaleDateString('es-EC', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    return `${semana}: el ${fecha}`
  }
  if (!curso.abreEl) return 'Se publica pronto'
  const fecha = new Date(curso.abreEl)
  const dia = fecha.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })
  const hora = fecha.toLocaleTimeString('es-EC', { hour: 'numeric', minute: '2-digit' })
  return `Se abre el ${dia} a las ${hora}`
}

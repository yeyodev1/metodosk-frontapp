/**
 * Cómo se nombra en pantalla cada estado y cada grupo de compra.
 *
 * Vive aparte de la vista porque el detalle también los necesita, y porque
 * las explicaciones son el texto que responde la pregunta que trae quien abre
 * esta pantalla: cuánto dinero entró de verdad.
 */
import type { AdminOrder, OrderGrupo } from '@/services/adminService'

export const ESTADOS_FILTRO = [
  { value: '', label: 'Todos los estados' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'canceled', label: 'Canceladas' },
  { value: 'failed', label: 'Fallidas' },
]

/** El estado tal como lo reporta PayPhone. */
export const ESTADOS: Record<AdminOrder['status'], string> = {
  approved: 'Aprobada',
  canceled: 'Cancelada',
  failed: 'Fallida',
}

/** Qué significa cada grupo en dinero, que es lo que se viene a mirar acá. */
export const GRUPOS: Record<OrderGrupo, { etiqueta: string; explica: string }> = {
  entro: {
    etiqueta: 'Cobrada',
    explica: 'PayPhone cobró este dinero: sí entró a la cuenta.',
  },
  porRevisar: {
    etiqueta: 'Cobrada · revisar',
    explica: 'El cobro sí entró, pero por un valor que no es ninguno de nuestros precios.',
  },
  pruebas: {
    etiqueta: 'Prueba',
    explica: 'Marcada como prueba o hecha con credenciales de prueba: no cuenta como dinero.',
  },
  noEntro: {
    etiqueta: 'No se cobró',
    explica: 'El intento se canceló o falló. No entró nada.',
  },
}

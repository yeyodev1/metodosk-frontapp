import APIBase from './httpBase'

/**
 * En qué grupo cae la compra. Son excluyentes entre sí, así que los cuatro
 * sumados dan el total registrado.
 *
 * - `entro`      dinero real, aprobado y por uno de nuestros precios
 * - `porRevisar` aprobado y real, pero por un monto que no reconocemos
 * - `pruebas`    aprobado en el entorno de prueba: no es dinero
 * - `noEntro`    cancelada o fallida: nunca se cobró
 */
export type OrderGrupo = 'entro' | 'porRevisar' | 'pruebas' | 'noEntro'

export interface AdminOrder {
  id: string
  clientTransactionId: string
  payphoneTransactionId: string | null
  status: 'approved' | 'canceled' | 'failed'
  grupo: OrderGrupo
  /** Monto en centavos. */
  amountCents: number
  /** false si el monto no coincide con ninguno de nuestros precios. */
  amountVerified: boolean
  currency: string
  environment: 'test' | 'prod'
  buyerName: string | null
  cardHolder: string | null
  email: string | null
  phoneNumber: string | null
  challenge: string | null
  accessMonths: number | null
  accessUntil: string | null
  authorizationCode: string | null
  createdAt: string
}

export interface OrdersBucket {
  compras: number
  centavos: number
}

export interface OrdersResponse {
  orders: AdminOrder[]
  resumen: {
    /** Cuántas compras trae la tabla ahora mismo. */
    mostradas: number
    /** Cuántas hay en total (el filtro de estado no lo altera). */
    registradas: number
    entro: OrdersBucket
    porRevisar: OrdersBucket
    pruebas: OrdersBucket
    noEntro: OrdersBucket
  }
  precios: {
    preventaCentavos: number
    regularCentavos: number
  }
}

export interface RestauracionResponse {
  revisadas: number
  /** Cuántas no guardaban la respuesta original: se dejaron intactas. */
  sinRespaldo: number
  corregidas: {
    buyerName: string | null
    antes: AdminOrder['status']
    ahora: AdminOrder['status']
  }[]
  mensaje: string
}

export interface RecursosEstado {
  /** Alumnas con correo registrado. */
  total: number
  /** A cuántas les falta todavía. */
  pendientes: number
  enviados: number
}

export interface RecursosEnvio {
  enviados: number
  fallidos: number
  pendientes: number
  detalle: { email: string; ok: boolean }[]
  mensaje: string
}

class AdminService extends APIBase {
  /**
   * Saca una compra del recaudado, o la devuelve.
   *
   * Es lo que hay que usar para los cobros que se hicieron probando: el
   * registro sobrevive, solo deja de contar como dinero recibido.
   */
  async marcarPrueba(id: string, esPrueba: boolean) {
    const response = await this.patch<{ mensaje: string }>(`admin/orders/${id}/prueba`, {
      esPrueba,
    })
    return response.data
  }

  /**
   * Recalcula el estado de cada compra desde la respuesta que PayPhone dio al
   * confirmarla, guardada en la propia orden. No consulta a nadie.
   */
  async restaurar() {
    const response = await this.post<RestauracionResponse>('admin/orders/restaurar', {})
    return response.data
  }

  /** Cómo va el envío de la lista de implementos a quienes ya compraron. */
  async estadoRecursos() {
    const response = await this.get<RecursosEstado>('admin/recursos')
    return response.data
  }

  /**
   * Manda la siguiente tanda de correos de recursos.
   *
   * El cron diario ya lo hace solo; esto sirve para arrancar sin esperar y
   * para reintentar los que fallaron.
   */
  async enviarRecursos() {
    const response = await this.post<RecursosEnvio>('admin/recursos/enviar', {})
    return response.data
  }

  /** Borra la compra para siempre. No hay vuelta atrás. */
  async eliminar(id: string) {
    const response = await this.delete<{ mensaje: string }>(`admin/orders/${id}`)
    return response.data
  }

  async orders(filters: { status?: string; search?: string } = {}) {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.search) params.set('search', filters.search)
    const query = params.toString()
    const response = await this.get<OrdersResponse>(`admin/orders${query ? `?${query}` : ''}`)
    return response.data
  }
}

export default new AdminService()

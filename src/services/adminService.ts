import APIBase from './httpBase'

export interface AdminOrder {
  id: string
  clientTransactionId: string
  status: 'approved' | 'canceled' | 'failed'
  /** Monto en centavos. */
  amountCents: number
  /** false si el monto no coincide con ninguno de nuestros precios. */
  amountVerified: boolean
  environment: 'test' | 'prod'
  buyerName: string | null
  email: string | null
  phoneNumber: string | null
  challenge: string | null
  accessUntil: string | null
  authorizationCode: string | null
  createdAt: string
}

export interface OrdersResponse {
  orders: AdminOrder[]
  resumen: {
    total: number
    aprobadas: number
    /** Solo cuenta las compras de producción. */
    recaudadoCentavos: number
  }
}

class AdminService extends APIBase {
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

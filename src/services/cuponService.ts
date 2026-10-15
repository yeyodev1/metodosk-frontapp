import APIBase from './httpBase'

export type EstadoCupon = 'activo' | 'programado' | 'vencido' | 'pausado' | 'agotado'

export interface CuponAdmin {
  id: string
  code: string
  percent: number
  startsAt: string
  /** null = sin vencimiento. */
  endsAt: string | null
  /** null = sin tope. */
  maxUses: number | null
  active: boolean
  note: string | null
  estado: EstadoCupon
  /** Compras reales (aprobadas en producción) hechas con el cupón. */
  ventas: number
  recaudadoCents: number
  baseCents: number
  finalCents: number
  createdAt: string
}

export interface DatosCupon {
  code?: string
  percent?: number
  startsAt?: string | null
  endsAt?: string | null
  maxUses?: number | null
  note?: string | null
  active?: boolean
}

class CuponService extends APIBase {
  async listar() {
    const { data } = await this.get<{ cupones: CuponAdmin[]; baseCents: number }>('admin/cupones')
    return data
  }

  async crear(datos: DatosCupon) {
    const { data } = await this.post<CuponAdmin>('admin/cupones', datos)
    return data
  }

  /** El código no se edita: ya puede estar circulando en links. */
  async editar(id: string, datos: Omit<DatosCupon, 'code'>) {
    const { data } = await this.patch<CuponAdmin>(`admin/cupones/${id}`, datos)
    return data
  }

  async eliminar(id: string) {
    await this.delete(`admin/cupones/${id}`)
  }
}

export default new CuponService()

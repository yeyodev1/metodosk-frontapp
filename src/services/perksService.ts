import APIBase from './httpBase'

/**
 * Qué le corresponde a esta compradora por la fecha en que compró.
 *
 * Lo resuelve el servidor: el corte depende de cuándo pagó, y esa fecha no
 * puede salir del navegador — bastaría cambiar el reloj del teléfono.
 */
export interface Beneficios {
  /** true mientras el reto siga siendo pre-venta y no un producto abierto. */
  enPreventa: boolean
  /** Cuándo se abre el contenido. */
  apertura: string
  /** Hasta cuándo comprar incluye el grupo de Telegram. */
  telegramDeadline: string
  /** true si entró a tiempo para la comunidad de Telegram. */
  telegramIncluido: boolean
  /** true si compró en pre-venta: le toca el grupo con Scarlet y Karen. */
  grupoPremium: boolean
  primeraCompra: string | null
}

class PerksService extends APIBase {
  async beneficios() {
    const { data } = await this.get<Beneficios>('payments/beneficios')
    return data
  }
}

export default new PerksService()

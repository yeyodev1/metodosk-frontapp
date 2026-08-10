import APIBase from './httpBase'

export interface PayphoneConfirmation {
  transactionStatus: 'Approved' | 'Canceled' | string
  clientTransactionId: string
  authorizationCode?: string
  amount: number
  message?: string
}

/**
 * Confirmación de la transacción de PayPhone.
 *
 * PayPhone exige un POST a /api/confirm dentro de los 5 minutos siguientes al
 * pago o reversa la transacción automáticamente. Esa llamada necesita el token
 * secreto, así que TIENE que vivir en el backend — nunca en el navegador.
 *
 * Este servicio queda listo apuntando a nuestro backend (aún no existe); el
 * backend es el que habla con PayPhone.
 */
class PaymentService extends APIBase {
  /** TODO(backend): implementar POST /payments/confirm en el API. */
  async confirm(id: string, clientTxId: string) {
    const response = await this.post<PayphoneConfirmation>('payments/confirm', {
      id,
      clientTxId,
    })
    return response.data
  }
}

export default new PaymentService()

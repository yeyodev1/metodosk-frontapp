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
export interface ConfirmContact {
  name?: string
  email?: string
  phone?: string
  challenge?: string
}

class PaymentService extends APIBase {
  /**
   * El contacto es opcional: si no llega, el backend usa el correo que
   * devuelve PayPhone. Sirve para el correo de acceso y para el registro.
   */
  async confirm(id: string, clientTxId: string, contact?: ConfirmContact) {
    const response = await this.post<PayphoneConfirmation>('payments/confirm', {
      id,
      clientTxId,
      contact,
    })
    return response.data
  }
}

export default new PaymentService()

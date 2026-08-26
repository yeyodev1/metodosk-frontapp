/**
 * PayPhone se lleva a la compradora fuera del sitio y la devuelve con una
 * carga nueva de la app, así que los datos del formulario se pierden.
 *
 * Se guardan aquí antes de abrir la pasarela y se recuperan en la página de
 * resultado, para poder mandarlos al backend junto con la confirmación.
 */
import type { CheckoutContact } from './checkout'

export interface PendingCheckout extends CheckoutContact {
  /** Nombre del reto elegido, p. ej. "SK Recomposición". */
  challenge: string
}

const KEY = 'metodosk:checkout-pendiente'

/** Guarda el contacto asociado a la transacción que está por iniciarse. */
export function rememberCheckout(clientTransactionId: string, data: PendingCheckout): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ clientTransactionId, ...data }))
  } catch {
    // Modo privado o storage lleno: el backend usará el correo que dé PayPhone.
  }
}

/** Devuelve el contacto si corresponde a esta transacción. */
export function recallCheckout(clientTransactionId: string): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as PendingCheckout & { clientTransactionId?: string }
    if (saved.clientTransactionId !== clientTransactionId) return null
    return { name: saved.name, email: saved.email, phone: saved.phone, challenge: saved.challenge }
  } catch {
    return null
  }
}

export function forgetCheckout(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* nada que limpiar */
  }
}

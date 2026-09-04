/**
 * Meta — Pixel del navegador + espejo servidor (Conversions API).
 *
 * Acá solo vive el ID del pixel, que es público por diseño: va escrito en el
 * HTML de cualquier sitio que lo use. El token de la Conversions API NO se
 * configura acá ni con prefijo VITE_ — con él se pueden inyectar conversiones
 * falsas en la cuenta publicitaria, así que vive solo en el backend.
 */

export const META_PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string) || ''

/**
 * Apagado explícito, para túneles y previews.
 *
 * Sirve para no ensuciar el dataset mientras se prueba: unas cuantas compras
 * de mentira en un preview desvían la optimización de una campaña real.
 */
export const META_ENABLED =
  Boolean(META_PIXEL_ID) && import.meta.env.VITE_META_PIXEL_ENABLED !== 'false'

/** Los eventos estándar de Meta que dispara este sitio. */
export type MetaEventName =
  | 'PageView'
  | 'ViewContent'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Purchase'

/**
 * El id de la compra sale de la transacción, no de un aleatorio.
 *
 * El navegador y el servidor mandan la misma compra por caminos distintos.
 * Con el mismo `event_id` Meta se queda con una sola; sin él, cada venta se
 * contaría dos veces y el ROAS de la campaña saldría a la mitad.
 * La misma fórmula está en metodosk-backapp/src/services/meta.service.ts.
 */
export const purchaseEventId = (clientTransactionId: string): string =>
  `purchase-${clientTransactionId}`

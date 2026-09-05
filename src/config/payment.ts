/**
 * Configuración de cobro — PayPhone "Cajita de Pagos".
 * https://docs.payphone.app/cajita-de-pagos
 *
 * IMPORTANTE: todos los montos van en CENTAVOS y como enteros.
 * PayPhone exige: amount = amountWithoutTax + amountWithTax + tax + service + tip
 */

export type PaymentMode = 'simulation' | 'live'

/**
 * 'simulation' (por defecto) no cobra nada ni contacta a PayPhone: el checkout
 * hace el recorrido completo con datos falsos. Cambiar a 'live' en .env solo
 * cuando exista el backend que confirme la transacción.
 */
export const PAYMENT_MODE: PaymentMode =
  (import.meta.env.VITE_PAYPHONE_MODE as PaymentMode) || 'simulation'

export const PAYPHONE_TOKEN = import.meta.env.VITE_PAYPHONE_TOKEN ?? ''
export const PAYPHONE_STORE_ID = import.meta.env.VITE_PAYPHONE_STORE_ID ?? ''

export const PAYPHONE_SDK = {
  css: 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css',
  js: 'https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js',
}

/** Precios en centavos. El precio es final: sin IVA desglosado. */
export const PRICES = {
  presale: 6700,
  regular: 11100,
} as const

/**
 * Cuándo cierra la pre-venta. Espejo de PRESALE_DEADLINE en el backend.
 *
 * Lleva el desfase -05:00 escrito: sin él, el navegador lo interpretaría en la
 * zona de quien mira, y buena parte de las compradoras están fuera de Ecuador.
 * El corte es uno solo para todas.
 */
export const PRESALE_DEADLINE = '2026-09-14T23:59:59-05:00'

export const CURRENCY = 'USD'
/** Ecuador (UTC-5). */
export const TIME_ZONE = -5

export const formatUsd = (cents: number): string =>
  `$${(cents / 100).toLocaleString('es-EC', {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`

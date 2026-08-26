/**
 * Integración con la Cajita de Pagos de PayPhone.
 * https://docs.payphone.app/cajita-de-pagos
 *
 * En modo 'simulation' nada de esto se ejecuta: el SDK ni siquiera se descarga.
 */
import {
  CURRENCY,
  PAYPHONE_SDK,
  PAYPHONE_STORE_ID,
  PAYPHONE_TOKEN,
  TIME_ZONE,
} from '@/config/payment'

export interface PayphoneTransaction {
  token: string
  clientTransactionId: string
  /** Total en centavos. Debe ser la suma de los demás montos. */
  amount: number
  amountWithoutTax: number
  amountWithTax: number
  tax: number
  service: number
  tip: number
  currency: string
  storeId: string
  reference: string
  lang: string
  defaultMethod: string
  timeZone: number
  /** A dónde vuelve PayPhone tras el pago, con ?id y ?clientTransactionId. */
  responseUrl: string
  email?: string
  documentId?: string
}

declare global {
  interface Window {
    PPaymentButtonBox?: new (config: PayphoneTransaction) => {
      render: (elementId: string) => void
    }
  }
}

let sdkPromise: Promise<void> | null = null

/** Descarga CSS + SDK una sola vez. */
export function loadPayphoneSdk(): Promise<void> {
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise<void>((resolve, reject) => {
    if (!document.querySelector(`link[href="${PAYPHONE_SDK.css}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = PAYPHONE_SDK.css
      document.head.appendChild(link)
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAYPHONE_SDK.js}"]`,
    )
    if (existing) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.type = 'module'
    script.src = PAYPHONE_SDK.js
    script.onload = () => resolve()
    script.onerror = () => {
      sdkPromise = null
      reject(new Error('No se pudo cargar la Cajita de Pagos de PayPhone'))
    }
    document.head.appendChild(script)
  })

  return sdkPromise
}

/** Identificador único de transacción, exigido por PayPhone. */
export function newClientTransactionId(planId: string): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `SK-${planId.toUpperCase()}-${Date.now()}-${random}`
}

export interface BuildOptions {
  planId: string
  /** Total en centavos. Precio final, sin IVA desglosado. */
  amount: number
  reference: string
  email?: string
}

/** Ruta a la que PayPhone devuelve a la usuaria al terminar. */
const RESULT_PATH = '/pago/resultado'

/**
 * Se arma con el origin actual en vez de fijarla: así el pago vuelve al sitio
 * desde el que se inició —producción, túnel o local— sin depender de la URL
 * que esté configurada en el panel de PayPhone.
 */
function responseUrl(planId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://metodosk.ec'
  return `${origin}${RESULT_PATH}?plan=${encodeURIComponent(planId)}`
}

/**
 * PayPhone exige amount = amountWithoutTax + amountWithTax + tax + service + tip.
 * Acá el precio es final y sin impuesto desglosado, así que todo va en
 * amountWithoutTax.
 */
export function buildTransaction(options: BuildOptions): PayphoneTransaction {
  return {
    token: PAYPHONE_TOKEN,
    clientTransactionId: newClientTransactionId(options.planId),
    amount: options.amount,
    amountWithoutTax: options.amount,
    amountWithTax: 0,
    tax: 0,
    service: 0,
    tip: 0,
    currency: CURRENCY,
    storeId: PAYPHONE_STORE_ID,
    reference: options.reference,
    lang: 'es',
    defaultMethod: 'card',
    timeZone: TIME_ZONE,
    responseUrl: responseUrl(options.planId),
    email: options.email,
    // phoneNumber se omite a propósito: la Cajita no lee el código de país del
    // valor que recibe. Deja su selector en +1 y mete la cadena entera en el
    // campo nacional, así que un +593… quedaba como +1 593…. Sin el dato,
    // PayPhone lo pide con su propio selector y el número sale bien.
    // El teléfono que captura nuestro formulario se usa para el contacto.
  }
}

/** Monta la cajita dentro de un contenedor. Solo se llama en modo 'live'. */
export async function renderPayphoneBox(
  elementId: string,
  transaction: PayphoneTransaction,
): Promise<void> {
  await loadPayphoneSdk()

  // El SDK es un módulo ES: expone la clase en window tras evaluarse.
  const start = Date.now()
  while (!window.PPaymentButtonBox) {
    if (Date.now() - start > 8000) {
      throw new Error('La Cajita de Pagos no respondió a tiempo')
    }
    await new Promise((resolve) => setTimeout(resolve, 60))
  }

  new window.PPaymentButtonBox(transaction).render(elementId)
}

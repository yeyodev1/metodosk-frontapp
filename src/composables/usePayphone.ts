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
  email?: string
  phoneNumber?: string
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
  phoneNumber?: string
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
    email: options.email,
    phoneNumber: options.phoneNumber,
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

/**
 * Pixel de Meta + espejo servidor (Conversions API).
 *
 * El pixel solo, hoy, mide mal: entre bloqueadores de anuncios, iOS y el fin
 * de las cookies de terceros se pierde una parte grande de las conversiones.
 * Por eso cada evento sale por dos caminos —navegador y servidor— con el
 * MISMO `eventId`. Meta deduplica y se queda con uno; lo que se gana es la
 * compra que el navegador nunca reportó.
 *
 * Nada de acá puede lanzar: si la medición falla, la compra sigue.
 */
import { META_ENABLED, META_PIXEL_ID, type MetaEventName } from '@/config/meta'
import { resolveApiBaseUrl } from '@/services/apiUrl'

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] }
    _fbq?: unknown
  }
}

export interface MetaContact {
  email?: string | null
  phone?: string | null
  name?: string | null
}

export interface MetaTrackOptions {
  /** Para deduplicar contra el evento del servidor. Si no va, se genera uno. */
  eventId?: string
  contact?: MetaContact
  value?: number
  currency?: string
  contentIds?: string[]
  contentName?: string | null
  /**
   * Copiar el evento al backend. Se apaga para Purchase: esa conversión la
   * manda el servidor al confirmar el cobro con PayPhone, con el monto real
   * verificado. Mandarla también desde acá sería aceptar el importe que diga
   * el navegador.
   */
  mirror?: boolean
}

let cargado = false

/** Inyecta el snippet oficial. `init` sin PageView: ese lo dispara el router. */
export function initMetaPixel(): void {
  if (cargado || !META_ENABLED || typeof window === 'undefined') return
  cargado = true

  /* eslint-disable */
  ;(function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e) as HTMLScriptElement
    t.async = true
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  window.fbq?.('init', META_PIXEL_ID)
}

function leerCookie(nombre: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${nombre}=([^;]*)`))
  return match ? decodeURIComponent(match[2]!) : null
}

/** Cookie de navegador del pixel. Identifica al visitante entre sesiones. */
export function metaFbp(): string | null {
  return leerCookie('_fbp')
}

const FBC_KEY = 'metodosk:fbc'

/**
 * El clic del anuncio.
 *
 * Es el dato que ata la venta al anuncio que la produjo. Normalmente lo
 * escribe el pixel en la cookie `_fbc`, pero si el pixel está bloqueado esa
 * cookie nunca existe: por eso se reconstruye del `fbclid` de la URL con el
 * formato que espera Meta (`fb.1.<timestamp>.<fbclid>`) y se guarda, para que
 * sobreviva al viaje de ida y vuelta a PayPhone.
 */
export function metaFbc(): string | null {
  const cookie = leerCookie('_fbc')
  if (cookie) return cookie

  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid')
    if (fbclid) {
      const valor = `fb.1.${Date.now()}.${fbclid}`
      localStorage.setItem(FBC_KEY, valor)
      return valor
    }
    return localStorage.getItem(FBC_KEY)
  } catch {
    return null
  }
}

function nuevoEventId(nombre: string): string {
  const azar =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${nombre.toLowerCase()}-${Date.now()}-${azar}`
}

/**
 * Copia del evento hacia nuestro backend, que lo reenvía a Meta firmado con
 * el token de la Conversions API.
 *
 * `keepalive: true` y no `sendBeacon`: `AddPaymentInfo` ocurre justo antes de
 * que PayPhone se lleve la página, y un fetch normal se cancelaría al
 * descargar el documento. `sendBeacon` no sirve acá —solo admite peticiones
 * "simples", y un POST con Content-Type application/json a otro dominio exige
 * preflight, que sendBeacon no sabe hacer: fallaría en silencio.
 */
function espejoServidor(nombre: MetaEventName, eventId: string, options: MetaTrackOptions): void {
  const cuerpo = JSON.stringify({
    eventName: nombre,
    eventId,
    eventSourceUrl: window.location.href,
    fbp: metaFbp(),
    fbc: metaFbc(),
    value: options.value,
    contentIds: options.contentIds,
    contentName: options.contentName,
    contact: options.contact,
  })

  const url = `${resolveApiBaseUrl()}/meta/event`

  try {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: cuerpo,
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // La medición nunca frena la compra.
  }
}

/** Dispara un evento por los dos caminos y devuelve el id usado. */
export function trackMeta(nombre: MetaEventName, options: MetaTrackOptions = {}): string {
  const eventId = options.eventId ?? nuevoEventId(nombre)
  if (!META_ENABLED) return eventId

  try {
    const params: Record<string, unknown> = {}
    if (typeof options.value === 'number') {
      params.value = options.value
      params.currency = options.currency ?? 'USD'
    }
    if (options.contentIds?.length) {
      params.content_ids = options.contentIds
      params.content_type = 'product'
    }
    if (options.contentName) params.content_name = options.contentName

    window.fbq?.('track', nombre, params, { eventID: eventId })
  } catch {
    // fbq bloqueado: queda el camino del servidor, que es justamente el punto.
  }

  if (options.mirror !== false) espejoServidor(nombre, eventId, options)
  return eventId
}

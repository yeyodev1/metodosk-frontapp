/**
 * Teléfono en formato internacional para PayPhone y WhatsApp.
 *
 * La gente escribe su número de muchas formas. Para Ecuador, estas tres son
 * el mismo número y las tres deben quedar en +593995254965:
 *
 *   593995254965   con código de país
 *   0995254965     con el cero troncal que se usa al marcar dentro del país
 *   995254965      solo el número nacional
 */

export interface Country {
  /** ISO 3166-1 alpha-2. */
  code: string
  name: string
  /** Código telefónico, sin el +. */
  dial: string
  flag: string
  /** Largo del número nacional, ya sin cero troncal ni código de país. */
  lengths: number[]
}

/** Ecuador primero: es el país de la mayoría de las usuarias. */
export const COUNTRIES: Country[] = [
  { code: 'EC', name: 'Ecuador', dial: '593', flag: '🇪🇨', lengths: [9] },
  { code: 'CO', name: 'Colombia', dial: '57', flag: '🇨🇴', lengths: [10] },
  { code: 'PE', name: 'Perú', dial: '51', flag: '🇵🇪', lengths: [9] },
  // Los móviles mexicanos aún circulan con un 1 delante: 52 1 55 1234 5678.
  { code: 'MX', name: 'México', dial: '52', flag: '🇲🇽', lengths: [10, 11] },
  { code: 'CL', name: 'Chile', dial: '56', flag: '🇨🇱', lengths: [9] },
  { code: 'AR', name: 'Argentina', dial: '54', flag: '🇦🇷', lengths: [10, 11] },
  { code: 'VE', name: 'Venezuela', dial: '58', flag: '🇻🇪', lengths: [10] },
  { code: 'BO', name: 'Bolivia', dial: '591', flag: '🇧🇴', lengths: [8] },
  { code: 'PY', name: 'Paraguay', dial: '595', flag: '🇵🇾', lengths: [9] },
  { code: 'UY', name: 'Uruguay', dial: '598', flag: '🇺🇾', lengths: [8, 9] },
  { code: 'BR', name: 'Brasil', dial: '55', flag: '🇧🇷', lengths: [10, 11] },
  { code: 'PA', name: 'Panamá', dial: '507', flag: '🇵🇦', lengths: [8] },
  { code: 'CR', name: 'Costa Rica', dial: '506', flag: '🇨🇷', lengths: [8] },
  { code: 'GT', name: 'Guatemala', dial: '502', flag: '🇬🇹', lengths: [8] },
  { code: 'DO', name: 'Rep. Dominicana', dial: '1', flag: '🇩🇴', lengths: [10] },
  { code: 'US', name: 'Estados Unidos', dial: '1', flag: '🇺🇸', lengths: [10] },
  { code: 'ES', name: 'España', dial: '34', flag: '🇪🇸', lengths: [9] },
  { code: 'IT', name: 'Italia', dial: '39', flag: '🇮🇹', lengths: [9, 10] },
]

export const DEFAULT_COUNTRY = COUNTRIES[0]!

export function findCountry(code: string): Country {
  return COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY
}

const digitsOnly = (value: string): string => value.replace(/\D/g, '')

/**
 * Deja solo el número nacional: sin prefijo internacional, sin código de país
 * y sin el cero troncal con el que se marca dentro del país.
 */
export function toNationalNumber(raw: string, country: Country): string {
  let digits = digitsOnly(raw)
  if (!digits) return ''

  // 00 delante es el prefijo internacional que se usa en varios países.
  if (digits.startsWith('00')) digits = digits.slice(2)

  const max = Math.max(...country.lengths)
  if (digits.startsWith(country.dial) && digits.length > max) {
    digits = digits.slice(country.dial.length)
  }

  // El cero troncal nunca viaja en el formato internacional.
  digits = digits.replace(/^0+/, '')

  return digits
}

/**
 * Si el número trae el código de otro país, devuelve ese país para poder
 * cambiar el selector solo. Null si no hay nada que deducir.
 */
export function detectCountry(raw: string, current: Country): Country | null {
  let digits = digitsOnly(raw)
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length < 8) return null

  // El país actual manda: si el número ya le calza, no lo cambiamos.
  if (current.lengths.includes(toNationalNumber(raw, current).length)) return null

  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => digits.startsWith(c.dial) && c.lengths.includes(digits.length - c.dial.length))

  return match && match.code !== current.code ? match : null
}

export function isValidNumber(raw: string, country: Country): boolean {
  return country.lengths.includes(toNationalNumber(raw, country).length)
}

/** Formato E.164 (+593995254965), que es el que espera PayPhone. */
export function toE164(raw: string, country: Country): string {
  const national = toNationalNumber(raw, country)
  return national ? `+${country.dial}${national}` : ''
}

/** Agrupa los dígitos para que se lean mientras se escriben. */
export function formatNational(raw: string, country: Country): string {
  const national = toNationalNumber(raw, country)
  if (country.code === 'EC' && national.length > 2) {
    // 99 525 4965
    return [national.slice(0, 2), national.slice(2, 5), national.slice(5, 9)]
      .filter(Boolean)
      .join(' ')
  }
  return national.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

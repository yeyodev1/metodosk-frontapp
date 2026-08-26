export interface CheckoutContact {
  name: string
  email: string
  /** Formato internacional E.164, p. ej. +593995254965. */
  phone: string
}

export type CheckoutErrors = Partial<Record<keyof CheckoutContact, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
/** + seguido del código de país y el número nacional. */
const E164 = /^\+[1-9]\d{7,14}$/

/** Validación local — el backend vuelve a validar al confirmar el pago. */
export function validateContact(contact: CheckoutContact): CheckoutErrors {
  const errors: CheckoutErrors = {}

  if (contact.name.trim().length < 3) errors.name = 'Escribe tu nombre completo'
  if (!EMAIL.test(contact.email.trim())) errors.email = 'Revisa tu correo'
  if (!E164.test(contact.phone)) errors.phone = 'Revisa tu número de WhatsApp'

  return errors
}

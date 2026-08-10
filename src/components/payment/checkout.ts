export interface CheckoutContact {
  name: string
  email: string
  phone: string
}

export type CheckoutErrors = Partial<Record<keyof CheckoutContact, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Validación local — el backend volverá a validar cuando exista. */
export function validateContact(contact: CheckoutContact): CheckoutErrors {
  const errors: CheckoutErrors = {}

  if (contact.name.trim().length < 3) errors.name = 'Escribe tu nombre completo'
  if (!EMAIL.test(contact.email.trim())) errors.email = 'Revisa tu correo'
  if (contact.phone.replace(/\D/g, '').length < 9) errors.phone = 'Revisa tu número'

  return errors
}

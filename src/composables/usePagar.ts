/**
 * El paso de pagar: guarda el contacto, fija el monto (con cupón, el que dice
 * el servidor) y monta la Cajita de PayPhone.
 *
 * Vive aparte de la página de compra para que la vista solo arme el diseño.
 */
import { nextTick, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Challenge } from '@/config/site'
import { PAYMENT_MODE } from '@/config/payment'
import { buildTransaction, renderPayphoneBox } from '@/composables/usePayphone'
import { trackMeta } from '@/composables/useMetaPixel'
import { useCupon } from '@/composables/useCupon'
import paymentService from '@/services/paymentService'
import type { CheckoutContact } from '@/components/payment/checkout'
import { rememberCheckout } from '@/components/payment/pendingCheckout'

/** Id del contenedor donde PayPhone dibuja su botón. */
export const CAJITA_ID = 'pp-button'

export function usePagar(reto: Ref<Challenge | null>) {
  const router = useRouter()
  const { cupon, precio, quitar: quitarCupon, error: errorCupon } = useCupon()

  const status = ref<'form' | 'paying' | 'error'>('form')
  const errorMessage = ref('')
  const enviando = ref(false)

  async function pagar(contact: CheckoutContact) {
    const elegido = reto.value
    if (!elegido || enviando.value) return
    enviando.value = true

    try {
      const transaction = buildTransaction({
        planId: elegido.id,
        amount: precio.value,
        reference: `Método SK · ${elegido.name} · ${contact.name}`,
        email: contact.email,
      })

      /**
       * Lead: es el único punto del embudo donde tenemos nombre, correo y
       * WhatsApp reales. Ese contacto viaja hasheado a la Conversions API y
       * es lo que le permite a Meta cruzar a esta persona con su cuenta.
       */
      trackMeta('Lead', {
        value: precio.value / 100,
        contentIds: [elegido.id],
        contentName: elegido.name,
        contact: { name: contact.name, email: contact.email, phone: contact.phone },
      })

      // Modo simulación: no se contacta a PayPhone ni se cobra nada.
      if (PAYMENT_MODE === 'simulation') {
        router.push({
          name: 'PaymentResult',
          query: {
            status: 'simulated',
            clientTransactionId: transaction.clientTransactionId,
            plan: elegido.name,
          },
        })
        return
      }

      /**
       * PayPhone nos saca del sitio, así que el contacto se guarda en el
       * servidor antes de abrir la cajita: el `sessionStorage` se pierde
       * cuando el navegador de Instagram devuelve a la compradora en otra
       * pestaña, y las credenciales se iban al correo de su tarjeta.
       */
      const intent = await paymentService.saveIntent({
        clientTransactionId: transaction.clientTransactionId,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        challenge: elegido.name,
        coupon: cupon.value?.code,
      })

      /**
       * Con cupón se cobra el monto que fijó el servidor, no el que pintó el
       * navegador. Si el cupón dejó de valer entre que lo vio y que pagó, no
       * se le cobra el precio lleno por sorpresa: se le avisa y decide ella.
       */
      if (cupon.value) {
        if (!intent.cupon) {
          quitarCupon()
          errorCupon.value = intent.guardado
            ? 'Tu cupón ya no está vigente. Revisa el precio antes de seguir.'
            : 'No pudimos validar tu cupón. Intenta de nuevo en unos segundos.'
          return
        }
        transaction.amount = intent.cupon.finalCents
        transaction.amountWithoutTax = intent.cupon.finalCents
      }

      // Y en el navegador, que responde al instante cuando sí sobrevive.
      rememberCheckout(transaction.clientTransactionId, { ...contact, challenge: elegido.name })

      /**
       * AddPaymentInfo justo antes de abrir la Cajita. El espejo al servidor
       * va con `keepalive` (ver useMetaPixel) porque PayPhone se lleva la
       * página enseguida.
       */
      trackMeta('AddPaymentInfo', {
        value: transaction.amount / 100,
        contentIds: [elegido.id],
        contentName: elegido.name,
        contact: { name: contact.name, email: contact.email, phone: contact.phone },
      })

      status.value = 'paying'
      await nextTick()
      await renderPayphoneBox(CAJITA_ID, transaction)
    } catch (error) {
      status.value = 'error'
      errorMessage.value =
        error instanceof Error ? error.message : 'No se pudo abrir la pasarela de pago'
    } finally {
      enviando.value = false
    }
  }

  function volverAlFormulario() {
    status.value = 'form'
    errorMessage.value = ''
  }

  return { status, errorMessage, enviando, pagar, volverAlFormulario }
}

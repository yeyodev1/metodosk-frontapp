<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useBodyScrollLock } from '@/composables/useBodyScroll'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import CheckoutForm from './CheckoutForm.vue'
import { useCheckout } from '@/composables/useCheckout'
import { CHALLENGES } from '@/config/site'
import { buildTransaction, renderPayphoneBox } from '@/composables/usePayphone'
import { PAYMENT_MODE, PRICES, formatUsd } from '@/config/payment'
import { trackMeta } from '@/composables/useMetaPixel'
import type { CheckoutContact } from './checkout'
import { rememberCheckout } from './pendingCheckout'
import type { Challenge } from '@/config/site'

const router = useRouter()
const { isOpen, selected, needsChoice, select, close } = useCheckout()

const dialog = ref<HTMLElement | null>(null)
const body = ref<HTMLElement | null>(null)
const status = ref<'form' | 'paying' | 'error'>('form')
const errorMessage = ref('')

/** Reto marcado por la usuaria; se resalta un instante antes de avanzar. */
const chosenId = ref<Challenge['id'] | null>(null)

/**
 * Al elegir dejamos que el resalte se vea antes de cambiar de paso: sin esa
 * pausa el clic no se siente registrado.
 */
async function choose(id: Challenge['id']) {
  if (chosenId.value) return
  chosenId.value = id
  await new Promise((resolve) => setTimeout(resolve, 220))
  select(id)
}

/**
 * El alto del modal cambia entre un paso y otro. Sin animarlo, el diálogo
 * pega un salto: acá se fija el alto de salida y se interpola hasta el nuevo.
 */
let heightBefore = 0

function lockHeight() {
  const el = body.value
  if (!el) return
  heightBefore = el.offsetHeight
  el.style.height = `${heightBefore}px`
}

function growHeight() {
  const el = body.value
  if (!el) return
  const target = el.scrollHeight
  el.style.height = `${heightBefore}px`
  void el.offsetHeight // fuerza reflow para que la transición arranque
  el.style.height = `${target}px`
}

function releaseHeight() {
  if (body.value) body.value.style.height = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

// El candado se cuenta y se suelta al desmontar — ver useBodyScroll.
useBodyScrollLock(isOpen)

watch(isOpen, async (open) => {
  if (open) {
    status.value = 'form'
    errorMessage.value = ''
    chosenId.value = null
    releaseHeight()
    window.addEventListener('keydown', onKeydown)
    await nextTick()
    dialog.value?.focus()
  } else {
    window.removeEventListener('keydown', onKeydown)
  }
})

async function submit(contact: CheckoutContact) {
  const transaction = buildTransaction({
    planId: selected.value.id,
    amount: PRICES.presale,
    reference: `Método SK · ${selected.value.name} · ${contact.name}`,
    email: contact.email,
  })

  /**
   * Lead: es el único punto del embudo donde tenemos nombre, correo y
   * WhatsApp reales. Ese contacto viaja hasheado a la Conversions API y es lo
   * que le permite a Meta cruzar a esta persona con su cuenta —de ahí sale la
   * calidad del emparejamiento— aunque después no complete el pago.
   */
  trackMeta('Lead', {
    value: PRICES.presale / 100,
    contentIds: [selected.value.id],
    contentName: selected.value.name,
    contact: { name: contact.name, email: contact.email, phone: contact.phone },
  })

  // Modo simulación: no se contacta a PayPhone ni se cobra nada.
  if (PAYMENT_MODE === 'simulation') {
    close()
    router.push({
      name: 'PaymentResult',
      query: {
        status: 'simulated',
        clientTransactionId: transaction.clientTransactionId,
        plan: selected.value.name,
      },
    })
    return
  }

  // PayPhone nos saca del sitio: el contacto se guarda para recuperarlo al volver.
  rememberCheckout(transaction.clientTransactionId, {
    ...contact,
    challenge: selected.value.name,
  })

  /**
   * AddPaymentInfo justo antes de abrir la Cajita. El espejo al servidor va
   * con `keepalive` (ver useMetaPixel) porque PayPhone se lleva la página
   * enseguida y una petición normal se cancelaría al descargar el documento.
   */
  trackMeta('AddPaymentInfo', {
    value: PRICES.presale / 100,
    contentIds: [selected.value.id],
    contentName: selected.value.name,
    contact: { name: contact.name, email: contact.email, phone: contact.phone },
  })

  status.value = 'paying'
  try {
    await nextTick()
    await renderPayphoneBox('pp-button', transaction)
  } catch (error) {
    status.value = 'error'
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo abrir la pasarela de pago'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="checkout" @click.self="close">
        <div
          ref="dialog"
          class="checkout__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
          tabindex="-1"
        >
          <button type="button" class="checkout__close" aria-label="Cerrar" @click="close">
            ×
          </button>

          <div class="checkout__summary">
            <p class="checkout__eyebrow">Reto Método SK · 3 meses</p>
            <Transition name="swap">
              <div v-if="needsChoice" key="choice" class="checkout__heading">
                <h2 id="checkout-title" class="checkout__plan">Elige tu reto</h2>
                <p class="checkout__claim">Los dos duran 3 meses y cuestan lo mismo.</p>
              </div>
              <div v-else :key="selected.id" class="checkout__heading">
                <h2 id="checkout-title" class="checkout__plan">{{ selected.name }}</h2>
                <p class="checkout__claim">{{ selected.claim }}</p>
              </div>
            </Transition>

            <p class="checkout__amount">
              {{ formatUsd(PRICES.presale) }}
              <s>{{ formatUsd(PRICES.regular) }}</s>
            </p>
            <p class="checkout__note">Un solo pago. Acceso a los 3 meses del reto.</p>

            <p v-if="PAYMENT_MODE === 'simulation'" class="checkout__demo">
              Modo demostración — no se realizará ningún cobro.
            </p>
          </div>

          <div ref="body" class="checkout__body">
            <Transition
              name="step"
              @before-leave="lockHeight"
              @enter="growHeight"
              @after-enter="releaseHeight"
            >
              <div v-if="needsChoice" key="choice" class="checkout__choice">
                <p class="checkout__choice-lead">¿Cuál de los dos quieres hacer?</p>
                <button
                  v-for="challenge in CHALLENGES"
                  :key="challenge.id"
                  type="button"
                  class="checkout__option"
                  :class="{
                    'checkout__option--chosen': chosenId === challenge.id,
                    'checkout__option--fading': chosenId && chosenId !== challenge.id,
                  }"
                  @click="choose(challenge.id)"
                >
                  <span class="checkout__option-name">{{ challenge.name }}</span>
                  <span class="checkout__option-claim">{{ challenge.claim }}</span>
                  <span class="checkout__option-for">{{ challenge.forWho }}</span>
                </button>
              </div>

              <CheckoutForm v-else-if="status === 'form'" key="form" @submit="submit" />

              <div v-else-if="status === 'paying'" key="paying" class="checkout__box">
                <p class="checkout__loading">Abriendo la pasarela segura de PayPhone…</p>
                <div id="pp-button" />
              </div>

              <div v-else key="error" class="checkout__error">
                <p>{{ errorMessage }}</p>
                <BaseButton variant="ghost" @click="status = 'form'">Intentar de nuevo</BaseButton>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.checkout {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(#100c0b, 0.6);
  backdrop-filter: blur(6px);
  overflow-y: auto;
}

.checkout__dialog {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  width: min(860px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background-color: $cream;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;

  &:focus {
    outline: none;
  }
}

.checkout__close {
  position: absolute;
  top: 0.7rem;
  right: 0.9rem;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 1.4rem;
  line-height: 1;
  color: $cream;
  background-color: rgba($ink, 0.35);
  transition: background-color 0.3s $ease;

  @include focus-ring($rose);

  &:hover {
    background-color: $ink;
  }
}

.checkout__summary {
  position: relative;
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: clamp(1.6rem, 4vw, 2.4rem);
  background-color: $ink;
  color: rgba($cream, 0.75);
}

.checkout__eyebrow {
  @include eyebrow;
  color: $rose;
}

.checkout__plan {
  font-size: $text-xl;
  color: $cream;
}

.checkout__claim {
  font-size: $text-sm;
}

.checkout__amount {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-top: $space-sm;
  font-family: $font-display;
  font-size: clamp(2.4rem, 6vw, 3.2rem);
  line-height: 1;
  color: $cream;

  s {
    font-family: $font-principal;
    font-size: $text-base;
    color: rgba($cream, 0.45);
  }
}

.checkout__note {
  font-size: $text-xs;
  color: rgba($cream, 0.55);
}

.checkout__demo {
  margin-top: auto;
  padding: 0.7rem 0.9rem;
  border: 1px dashed rgba($rose, 0.6);
  border-radius: $radius-sm;
  font-size: $text-xs;
  color: $rose-soft;
}

.checkout__body {
  position: relative;
  flex: 1 1 320px;
  padding: clamp(1.6rem, 4vw, 2.4rem);
  // El alto lo fija el JS durante el cambio de paso para que no salte.
  overflow: hidden;
  transition: height 0.45s $ease;
}

.checkout__heading {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.checkout__choice {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.checkout__choice-lead {
  font-size: $text-sm;
  color: $ink-soft;
}

.checkout__option {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.1rem;
  text-align: left;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-sm;
  background-color: transparent;
  transition:
    border-color 0.3s $ease,
    background-color 0.3s $ease,
    box-shadow 0.3s $ease,
    transform 0.3s $ease,
    opacity 0.3s $ease;

  @include focus-ring($rose);

  &:hover {
    border-color: $ink;
    background-color: rgba($ink, 0.04);
    transform: translateY(-2px);
    box-shadow: $shadow-sm;
  }

  &:active {
    transform: translateY(0);
  }

  /** El reto elegido se afirma un instante antes de pasar al formulario. */
  &--chosen {
    border-color: $ink;
    background-color: rgba($ink, 0.06);
    box-shadow: $shadow-md;
    transform: translateY(-2px) scale(1.015);
  }

  /** El otro se retira, para que la elección quede clara. */
  &--fading {
    opacity: 0.28;
    transform: scale(0.985);
  }
}

.checkout__option-name {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.checkout__option-claim {
  font-size: $text-sm;
  color: $ink-soft;
}

.checkout__option-for {
  font-size: $text-xs;
  color: rgba($ink, 0.55);
}

.checkout__box,
.checkout__error {
  display: flex;
  flex-direction: column;
  gap: $space-md;
}

.checkout__loading {
  font-size: $text-sm;
  color: $ink-soft;
}

.checkout__error p {
  color: $alert-error;
  font-size: $text-sm;
}

/* Cambio de paso dentro del modal: elegir reto -> formulario -> pasarela.
   El que sale se posiciona absoluto para que ambos se crucen y el modal
   nunca quede vacío. */
.step-enter-active {
  transition: opacity 0.34s $ease, transform 0.34s $ease;
}

.step-leave-active {
  position: absolute;
  inset: clamp(1.6rem, 4vw, 2.4rem);
  bottom: auto;
  transition: opacity 0.22s $ease, transform 0.22s $ease;
}

.step-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.step-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Título del panel oscuro: "Elige tu reto" -> nombre del reto. */
.swap-enter-active {
  transition: opacity 0.36s $ease, transform 0.36s $ease;
}

.swap-leave-active {
  position: absolute;
  transition: opacity 0.2s $ease, transform 0.2s $ease;
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .step-enter-active,
  .step-leave-active,
  .swap-enter-active,
  .swap-leave-active,
  .checkout__body,
  .checkout__option {
    transition-duration: 0.01ms;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s $ease;

  .checkout__dialog {
    transition: transform 0.4s $ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .checkout__dialog {
    transform: translateY(24px);
  }
}
</style>

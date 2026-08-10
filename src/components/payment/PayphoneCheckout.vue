<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import CheckoutForm from './CheckoutForm.vue'
import { useCheckout } from '@/composables/useCheckout'
import { buildTransaction, renderPayphoneBox } from '@/composables/usePayphone'
import { PAYMENT_MODE, PRICES, formatUsd } from '@/config/payment'
import type { CheckoutContact } from './checkout'

const router = useRouter()
const { isOpen, selected, close } = useCheckout()

const dialog = ref<HTMLElement | null>(null)
const status = ref<'form' | 'paying' | 'error'>('form')
const errorMessage = ref('')

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(isOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    status.value = 'form'
    errorMessage.value = ''
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
    phoneNumber: contact.phone,
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
            <h2 id="checkout-title" class="checkout__plan">{{ selected.name }}</h2>
            <p class="checkout__claim">{{ selected.claim }}</p>

            <p class="checkout__amount">
              {{ formatUsd(PRICES.presale) }}
              <s>{{ formatUsd(PRICES.regular) }}</s>
            </p>
            <p class="checkout__note">Un solo pago. Acceso a los 3 meses del reto.</p>

            <p v-if="PAYMENT_MODE === 'simulation'" class="checkout__demo">
              Modo demostración — no se realizará ningún cobro.
            </p>
          </div>

          <div class="checkout__body">
            <CheckoutForm v-if="status === 'form'" @submit="submit" />

            <div v-else-if="status === 'paying'" class="checkout__box">
              <p class="checkout__loading">Abriendo la pasarela segura de PayPhone…</p>
              <div id="pp-button" />
            </div>

            <div v-else class="checkout__error">
              <p>{{ errorMessage }}</p>
              <BaseButton variant="ghost" @click="status = 'form'">Intentar de nuevo</BaseButton>
            </div>
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
  flex: 1 1 320px;
  padding: clamp(1.6rem, 4vw, 2.4rem);
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

<script setup lang="ts">
/**
 * El resumen de la compra, en el panel oscuro de la página de pago.
 *
 * En escritorio queda fijo a la derecha mientras se llena el formulario: el
 * precio y lo que se lleva siguen a la vista hasta el botón de pagar. En el
 * celular va arriba, antes de los pasos.
 */
import type { Challenge } from '@/config/site'
import { PRICING } from '@/config/site'
import { PAYMENT_MODE } from '@/config/payment'
import CheckoutPrecio from './CheckoutPrecio.vue'

defineProps<{ reto: Challenge | null }>()
</script>

<template>
  <aside class="resumen">
    <p class="resumen__eyebrow">Tu compra · Reto Método SK</p>

    <Transition name="swap" mode="out-in">
      <div :key="reto?.id ?? 'ninguno'" class="resumen__reto">
        <h2 class="resumen__nombre">{{ reto ? reto.name : 'Elige tu reto' }}</h2>
        <p class="resumen__claim">
          {{ reto ? reto.claim : 'Los dos duran 3 meses y cuestan lo mismo.' }}
        </p>
      </div>
    </Transition>

    <CheckoutPrecio />

    <ul class="resumen__incluye">
      <li v-for="item in PRICING.includes" :key="item">{{ item }}</li>
    </ul>

    <p class="resumen__seguro">
      <span aria-hidden="true">🔒</span> {{ PRICING.guarantees.join(' · ') }}
    </p>

    <p v-if="PAYMENT_MODE === 'simulation'" class="resumen__demo">
      Modo demostración — no se realizará ningún cobro.
    </p>
  </aside>
</template>

<style lang="scss" scoped>
.resumen {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: clamp(1.4rem, 4vw, 2.2rem);
  border-radius: $radius-lg;
  background-color: $ink;
  color: rgba($cream, 0.75);
}

.resumen__eyebrow {
  @include eyebrow;
  color: $rose;
}

.resumen__reto {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.resumen__nombre {
  font-family: $font-display;
  font-size: $text-xl;
  line-height: 1.15;
  color: $cream;
}

.resumen__claim {
  font-size: $text-sm;
}

.resumen__incluye {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: $space-sm;
  padding-top: $space-sm;
  border-top: 1px solid rgba($cream, 0.12);
  list-style: none;
  font-size: $text-sm;

  li {
    position: relative;
    padding-left: 1.5rem;

    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: $rose;
      font-weight: 700;
    }
  }
}

.resumen__seguro {
  margin-top: $space-xs;
  font-size: $text-xs;
  color: rgba($cream, 0.55);
}

.resumen__demo {
  padding: 0.7rem 0.9rem;
  border: 1px dashed rgba($rose, 0.6);
  border-radius: $radius-sm;
  font-size: $text-xs;
  color: $rose-soft;
}

.swap-enter-active,
.swap-leave-active {
  transition: opacity 0.22s $ease, transform 0.22s $ease;
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .swap-enter-active,
  .swap-leave-active {
    transition-duration: 0.01ms;
  }
}

/* En el celular el resumen va arriba: la lista de lo incluido se recorta
   para que el formulario no quede a tres pantallas de distancia. */
@media (max-width: 899px) {
  .resumen__incluye {
    display: none;
  }
}
</style>

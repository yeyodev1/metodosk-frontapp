<script setup lang="ts">
/**
 * El precio del panel oscuro del checkout.
 *
 * Con cupón tiene que quedar clarísimo, sin hacer cuentas: cuánto costaba,
 * cuánto paga ahora, cuánto se ahorra y hasta cuándo vale. Si algo de eso
 * falta, la compradora duda de si el descuento de verdad se aplicó, y la duda
 * en el checkout es un pago que no se hace.
 */
import { computed } from 'vue'
import { useCupon } from '@/composables/useCupon'
import { PRICES, formatUsd } from '@/config/payment'

const { cupon, precio, ahorro } = useCupon()

const vence = computed(() => {
  if (!cupon.value?.endsAt) return ''
  return new Date(cupon.value.endsAt).toLocaleString('es-EC', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Guayaquil',
  })
})
</script>

<template>
  <div class="precio">
    <Transition name="cupon">
      <p v-if="cupon" class="precio__cupon">
        <span class="precio__cupon-codigo">{{ cupon.code }}</span>
        <span class="precio__cupon-pct">−{{ cupon.percent }}%</span>
      </p>
    </Transition>

    <Transition name="monto" mode="out-in">
      <p :key="precio" class="precio__monto">
        {{ formatUsd(precio) }}
        <s v-if="cupon">{{ formatUsd(cupon.baseCents || PRICES.regular) }}</s>
      </p>
    </Transition>

    <p v-if="cupon" class="precio__ahorro">
      Ahorras <strong>{{ formatUsd(ahorro) }}</strong> con tu cupón
    </p>
    <p class="precio__nota">Un solo pago por los 3 meses del reto.</p>
    <p v-if="vence" class="precio__vence">Descuento válido hasta el {{ vence }}</p>
  </div>
</template>

<style lang="scss" scoped>
.precio {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: $space-sm;
}

.precio__cupon {
  display: inline-flex;
  align-self: flex-start;
  align-items: stretch;
  overflow: hidden;
  border: 1px dashed rgba($rose, 0.7);
  border-radius: $radius-sm;
  font-size: $text-xs;
  letter-spacing: 0.04em;
}

.precio__cupon-codigo {
  padding: 0.3rem 0.65rem;
  color: $cream;
  font-weight: 600;
}

.precio__cupon-pct {
  padding: 0.3rem 0.6rem;
  background-color: $rose;
  color: $ink;
  font-weight: 700;
}

.precio__monto {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-family: $font-display;
  font-size: clamp(2.4rem, 6vw, 3.2rem);
  line-height: 1;
  color: $cream;

  s {
    font-family: $font-principal;
    font-size: $text-lg;
    color: rgba($cream, 0.45);
  }
}

.precio__ahorro {
  font-size: $text-sm;
  color: $rose-soft;

  strong {
    color: $cream;
  }
}

.precio__nota {
  font-size: $text-xs;
  color: rgba($cream, 0.55);
}

.precio__vence {
  font-size: $text-xs;
  color: rgba($cream, 0.7);
}

.cupon-enter-active,
.cupon-leave-active {
  transition: opacity 0.3s $ease, transform 0.3s $ease;
}

.cupon-enter-from,
.cupon-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.monto-enter-active,
.monto-leave-active {
  transition: opacity 0.22s $ease, transform 0.22s $ease;
}

.monto-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.monto-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (prefers-reduced-motion: reduce) {
  .cupon-enter-active,
  .cupon-leave-active,
  .monto-enter-active,
  .monto-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>

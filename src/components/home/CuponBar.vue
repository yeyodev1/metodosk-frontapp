<script setup lang="ts">
/**
 * La barra del cupón, pegada abajo como la de pre-venta y en el mismo lugar.
 *
 * Quien llega por un link con cupón tiene que saber desde el primer segundo
 * que su descuento ya está puesto: si lo descubre recién en el checkout, ya
 * leyó toda la página creyendo que pagaba el precio lleno. Toda la barra abre
 * el checkout.
 */
import { computed } from 'vue'
import { useCheckout } from '@/composables/useCheckout'
import { useCupon } from '@/composables/useCupon'
import { formatUsd } from '@/config/payment'

const { open } = useCheckout()
const { cupon } = useCupon()

const vence = computed(() => {
  if (!cupon.value?.endsAt) return ''
  return new Date(cupon.value.endsAt).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Guayaquil',
  })
})
</script>

<template>
  <Transition name="barra">
    <button v-if="cupon" type="button" class="barra" @click="open()">
      <span class="barra__texto">
        <span class="barra__pct">−{{ cupon.percent }}%</span>
        <span class="barra__detalle">
          <span class="barra__titulo">
            Tu cupón <strong>{{ cupon.code }}</strong> ya está aplicado
          </span>
          <span v-if="vence" class="barra__vence">Válido hasta el {{ vence }}</span>
        </span>
      </span>

      <span class="barra__precio">
        <strong>{{ formatUsd(cupon.finalCents) }}</strong>
        <s>{{ formatUsd(cupon.baseCents) }}</s>
      </span>

      <span class="barra__cta">Usar mi descuento</span>
    </button>
  </Transition>
</template>

<style lang="scss" scoped>
.barra {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.4rem;
  width: 100%;
  padding: 0.85rem $space-md;
  padding-bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px));
  border: none;
  border-top: 1px solid rgba($cream, 0.16);
  background-color: $wine;
  font-family: inherit;
  color: $cream;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s $ease;

  &:hover {
    background-color: #5f3340;
  }

  &:focus-visible {
    outline: 2px solid $cream;
    outline-offset: -4px;
  }
}

.barra__texto {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.barra__pct {
  flex: none;
  padding: 0.35rem 0.6rem;
  border: 1px dashed rgba($cream, 0.55);
  border-radius: $radius-sm;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
  color: $cream;
}

.barra__detalle {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.barra__titulo {
  font-size: $text-xs;
  color: rgba($cream, 0.85);
  overflow-wrap: anywhere;

  strong {
    color: $cream;
  }
}

.barra__vence {
  font-size: 0.68rem;
  color: rgba($cream, 0.6);
}

.barra__precio {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  white-space: nowrap;

  strong {
    font-family: $font-display;
    font-size: 1.35rem;
    line-height: 1;
    color: $cream;
  }

  s {
    font-size: $text-xs;
    color: rgba($cream, 0.5);
  }
}

.barra__cta {
  padding: 0.6rem 1.3rem;
  border-radius: $radius-pill;
  background-color: $cream;
  font-size: $text-xs;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $wine;
  white-space: nowrap;
}

.barra-enter-active {
  transition: transform 0.45s $ease;
}

.barra-enter-from {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .barra-enter-active {
    transition-duration: 0.01ms;
  }
}

@media (max-width: 767px) {
  .barra {
    flex-wrap: wrap;
    gap: 0.5rem 0.8rem;
    padding: 0.7rem $space-sm;
    padding-bottom: calc(0.7rem + env(safe-area-inset-bottom, 0px));
  }

  .barra__texto {
    flex: 1 1 100%;
  }

  .barra__precio {
    flex: 0 0 auto;

    strong {
      font-size: 1.15rem;
    }
  }

  .barra__cta {
    flex: 1 1 auto;
    padding: 0.65rem 1rem;
    text-align: center;
  }
}
</style>

<script setup lang="ts">
/**
 * La barra de pre-venta, pegada abajo durante todo el scroll.
 *
 * Va abajo y no arriba porque arriba compite con el header y solo se ve en el
 * hero. Pegada al borde inferior acompaña toda la lectura: la decisión de
 * comprar no se toma en el primer scroll, se toma en el tercero, y ahí es
 * donde tiene que haber un botón a mano.
 *
 * Es el atajo de compra: toda la barra abre el checkout, no solo el botón.
 */
import { useCheckout } from '@/composables/useCheckout'
import { useCuentaRegresiva } from '@/composables/useCuentaRegresiva'
import { PRICES, formatUsd } from '@/config/payment'

const { open } = useCheckout()
const { cerrada, piezas } = useCuentaRegresiva()
</script>

<template>
  <button v-if="!cerrada" type="button" class="barra" @click="open()">
    <span class="barra__texto">
      <span class="barra__titulo">La pre-venta cierra en</span>

      <span class="barra__reloj">
        <span v-for="pieza in piezas" :key="pieza.etiqueta" class="pieza">
          <span class="pieza__valor">{{ pieza.valor }}</span>
          <span class="pieza__etiqueta">{{ pieza.etiqueta }}</span>
        </span>
      </span>
    </span>

    <span class="barra__precio">
      <strong>{{ formatUsd(PRICES.presale) }}</strong>
      <s>{{ formatUsd(PRICES.regular) }}</s>
    </span>

    <span class="barra__cta">Quiero mi cupo</span>
  </button>
</template>

<style lang="scss" scoped>
/**
 * `fixed` y no `sticky`: sticky depende del contexto de scroll del padre y en
 * Safari se rompe en cuanto un ancestro tiene overflow o transform — y acá
 * varios lo tienen por las animaciones de entrada.
 *
 * El padding de abajo suma `env(safe-area-inset-bottom)` para que en iPhone la
 * barra no quede debajo del indicador de inicio.
 */
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

.barra__titulo {
  font-size: $text-xs;
  letter-spacing: 0.02em;
  color: rgba($cream, 0.78);
  white-space: nowrap;
}

/* ── El reloj ── */
.barra__reloj {
  display: flex;
  align-items: stretch;
  gap: 0.3rem;
}

.pieza {
  display: flex;
  align-items: baseline;
  gap: 0.12rem;
  padding: 0.28rem 0.5rem;
  border-radius: $radius-sm;
  background-color: rgba(#000, 0.22);
}

/**
 * Tabular y de ancho fijo: con cifras proporcionales el "11" y el "00" miden
 * distinto y la barra entera tiembla una vez por segundo.
 */
.pieza__valor {
  font-size: 0.95rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
  line-height: 1;
  color: $cream;
}

.pieza__etiqueta {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba($cream, 0.6);
}

/* ── Precio y CTA ── */
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

/* ── Móvil ── */
@media (max-width: 767px) {
  .barra {
    flex-wrap: wrap;
    gap: 0.5rem 0.8rem;
    padding: 0.7rem $space-sm;
    padding-bottom: calc(0.7rem + env(safe-area-inset-bottom, 0px));
  }

  .barra__texto {
    flex: 1 1 100%;
    justify-content: space-between;
  }

  .barra__titulo {
    font-size: 0.7rem;
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

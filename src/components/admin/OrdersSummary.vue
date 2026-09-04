<script setup lang="ts">
import { computed } from 'vue'
import type { OrdersResponse } from '@/services/adminService'

const props = defineProps<{ resumen: OrdersResponse['resumen']; precios: OrdersResponse['precios'] }>()

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`

/**
 * Las cuatro tarjetas, en orden de importancia. Los grupos son excluyentes,
 * así que sumados dan el total registrado: ningún dólar aparece dos veces.
 *
 * Las dos primeras se muestran siempre — que "no entró" marque $0.00 es
 * información. Las otras dos solo cuando existen, para no meter ruido.
 */
const tarjetas = computed(() => {
  const r = props.resumen
  return [
    {
      clave: 'entro',
      titulo: 'Sí entró',
      detalle: 'Dinero real ya cobrado por PayPhone',
      bucket: r.entro,
      destacada: true,
      mostrar: true,
    },
    {
      clave: 'noEntro',
      titulo: 'No entró',
      detalle: 'Intentos cancelados o fallidos',
      bucket: r.noEntro,
      destacada: false,
      mostrar: true,
    },
    {
      clave: 'porRevisar',
      titulo: 'Entró, pero revisar',
      detalle: 'Cobrado por un monto que no es nuestro precio',
      bucket: r.porRevisar,
      destacada: false,
      mostrar: r.porRevisar.compras > 0,
    },
    {
      clave: 'pruebas',
      titulo: 'Pruebas',
      detalle: 'No es dinero: pagos de prueba',
      bucket: r.pruebas,
      destacada: false,
      mostrar: r.pruebas.compras > 0,
    },
  ].filter((t) => t.mostrar)
})
</script>

<template>
  <div>
    <section class="cards">
      <div
        v-for="t in tarjetas"
        :key="t.clave"
        :class="['card', `card--${t.clave}`, { 'card--fuerte': t.destacada }]"
      >
        <span class="card__value">{{ usd(t.bucket.centavos) }}</span>
        <span class="card__title">{{ t.titulo }}</span>
        <span class="card__label">
          {{ t.bucket.compras }} {{ t.bucket.compras === 1 ? 'compra' : 'compras' }} ·
          {{ t.detalle }}
        </span>
      </div>
    </section>

    <p class="nota">
      Los totales son de <strong>todas</strong> las compras registradas ({{ resumen.registradas }}):
      no cambian al filtrar la tabla. Precios válidos: {{ usd(precios.preventaCentavos) }} en
      pre-venta y {{ usd(precios.regularCentavos) }} regular.
    </p>
  </div>
</template>

<style lang="scss" scoped>
.cards {
  @include flex-cards(210px, $space-sm);
  margin-bottom: 0.7rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.card--fuerte {
  flex-basis: 260px;
  background-color: $ink;

  .card__value,
  .card__title {
    color: $cream;
  }

  .card__label {
    color: rgba($cream, 0.55);
  }
}

.card--porRevisar {
  background-color: $alert-error-bg;
}

.card__value {
  font-family: $font-display;
  font-size: 1.9rem;
  line-height: 1.1;
  color: $ink;
}

.card--noEntro .card__value,
.card--pruebas .card__value {
  color: $ink-muted;
}

.card__title {
  font-size: $text-sm;
  font-weight: 600;
  color: $ink;
}

.card__label {
  font-size: $text-xs;
  color: $ink-muted;
}

.nota {
  margin-bottom: $space-md;
  font-size: $text-xs;
  color: $ink-muted;
}
</style>

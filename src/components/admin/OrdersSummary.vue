<script setup lang="ts">
import { computed, ref } from 'vue'
import adminService, {
  type OrdersResponse,
  type RestauracionResponse,
} from '@/services/adminService'

const props = defineProps<{ resumen: OrdersResponse['resumen']; precios: OrdersResponse['precios'] }>()
const emit = defineEmits<{ restaurado: [] }>()

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`

const restaurando = ref(false)
const informe = ref<RestauracionResponse | null>(null)
const falloRestaurar = ref('')

/**
 * Devuelve cada compra al estado que PayPhone reportó al confirmarla.
 *
 * Esa respuesta se guarda entera en la propia orden, así que esto reconstruye
 * el dato original en vez de consultarlo: no depende de la red ni puede
 * malinterpretar nada.
 */
async function restaurar() {
  restaurando.value = true
  falloRestaurar.value = ''
  informe.value = null
  try {
    informe.value = await adminService.restaurar()
    if (informe.value.corregidas.length) emit('restaurado')
  } catch (e: unknown) {
    falloRestaurar.value =
      (e as { message?: string }).message ?? 'No pudimos restaurar los estados'
  } finally {
    restaurando.value = false
  }
}

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

    <div class="pie">
      <p class="nota">
        Los totales son de <strong>todas</strong> las compras registradas ({{ resumen.registradas }}):
        no cambian al filtrar la tabla. Precios válidos: {{ usd(precios.preventaCentavos) }} en
        pre-venta y {{ usd(precios.regularCentavos) }} regular. Este es el <strong>bruto</strong>:
        PayPhone descuenta su comisión antes de depositar.
      </p>
      <button type="button" class="restaurar" :disabled="restaurando" @click="restaurar">
        {{ restaurando ? 'Restaurando…' : 'Restaurar estados originales' }}
      </button>
    </div>

    <p v-if="falloRestaurar" class="informe informe--error">{{ falloRestaurar }}</p>

    <div v-else-if="informe" class="informe">
      <p>
        <strong>{{ informe.mensaje }}</strong>
        Se revisaron {{ informe.revisadas }}.
        <template v-if="informe.sinRespaldo">
          {{ informe.sinRespaldo }} no guardaban la respuesta de PayPhone y se dejaron intactas.
        </template>
      </p>
      <ul v-if="informe.corregidas.length">
        <li v-for="(c, i) in informe.corregidas" :key="i">
          {{ c.buyerName || 'sin nombre' }} · <strong>{{ c.antes }} → {{ c.ahora }}</strong>
        </li>
      </ul>
    </div>
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

.pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  margin-bottom: $space-md;
}

.nota {
  flex: 1 1 320px;
  font-size: $text-xs;
  color: $ink-muted;
}

.restaurar {
  padding: 0.5rem 1rem;
  border: 1px solid rgba($ink, 0.16);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-soft;
  cursor: pointer;
  white-space: nowrap;
  transition:
    border-color 0.25s $ease,
    color 0.25s $ease;

  &:hover:not(:disabled) {
    border-color: rgba($ink, 0.4);
    color: $ink;
  }

  &:disabled {
    opacity: 0.55;
    cursor: progress;
  }
}

.informe {
  margin-bottom: $space-md;
  padding: 0.9rem 1.1rem;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-xs;
  color: $ink-soft;

  ul {
    margin-top: 0.6rem;
    padding-left: 1.1rem;
  }

  li {
    margin-top: 0.2rem;
  }
}

.informe--error {
  background-color: $alert-error-bg;
  color: $alert-error;
}
</style>

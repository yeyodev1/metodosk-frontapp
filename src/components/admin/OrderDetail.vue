<script setup lang="ts">
import { computed } from 'vue'
import type { AdminOrder } from '@/services/adminService'

const props = defineProps<{ order: AdminOrder; explica: string; estado: string }>()

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`

function fecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function fechaHora(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Todo lo que PayPhone nos devolvió de esta transacción, en orden de utilidad. */
const campos = computed(() => {
  const o = props.order
  return [
    { rotulo: 'Estado en PayPhone', valor: props.estado, mono: false },
    {
      rotulo: 'Entorno',
      valor: o.environment === 'prod' ? 'Producción · dinero real' : 'Prueba · no es dinero',
      mono: false,
    },
    { rotulo: 'Monto confirmado', valor: `${usd(o.amountCents)} ${o.currency}`, mono: false },
    {
      rotulo: '¿Monto reconocido?',
      valor: o.amountVerified
        ? 'Sí, es uno de nuestros precios'
        : 'No coincide con ningún precio nuestro',
      mono: false,
    },
    { rotulo: 'Nombre en la tarjeta', valor: o.cardHolder || '—', mono: false },
    { rotulo: 'Correo', valor: o.email || '—', mono: false },
    { rotulo: 'Teléfono', valor: o.phoneNumber || '—', mono: false },
    { rotulo: 'Código de autorización', valor: o.authorizationCode || '—', mono: true },
    { rotulo: 'Referencia nuestra', valor: o.clientTransactionId, mono: true },
    { rotulo: 'ID en PayPhone', valor: o.payphoneTransactionId || '—', mono: true },
    {
      rotulo: 'Acceso otorgado',
      valor: o.accessUntil
        ? `${o.accessMonths ?? '—'} meses · hasta ${fecha(o.accessUntil)}`
        : 'Sin acceso abierto',
      mono: false,
    },
    { rotulo: 'Fecha y hora', valor: fechaHora(o.createdAt), mono: false },
  ]
})
</script>

<template>
  <div class="detalle">
    <p class="detalle__explica">{{ explica }}</p>
    <dl class="campos">
      <div v-for="c in campos" :key="c.rotulo" class="campo">
        <dt>{{ c.rotulo }}</dt>
        <dd :class="{ mono: c.mono }">{{ c.valor }}</dd>
      </div>
    </dl>
  </div>
</template>

<style lang="scss" scoped>
.detalle__explica {
  margin-bottom: 0.9rem;
  font-size: $text-xs;
  color: $ink-soft;
}

.campos {
  @include flex-cards(190px, 0.9rem 1.6rem);
}

.campo {
  dt {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  dd {
    margin-top: 0.15rem;
    font-size: $text-sm;
    color: $ink;
    word-break: break-word;
  }
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: $text-xs;
}
</style>

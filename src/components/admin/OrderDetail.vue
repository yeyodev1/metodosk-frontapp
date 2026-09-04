<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import adminService, { type AdminOrder } from '@/services/adminService'

const props = defineProps<{ order: AdminOrder; explica: string; estado: string }>()
const emit = defineEmits<{ cambiada: [] }>()

/** Qué confirmación está abierta, si alguna. */
const confirmando = ref<'prueba' | 'borrar' | null>(null)
const guardando = ref(false)
const fallo = ref('')

const esPrueba = computed(() => props.order.environment === 'test')

async function aplicar() {
  guardando.value = true
  fallo.value = ''
  try {
    if (confirmando.value === 'borrar') await adminService.eliminar(props.order.id)
    else await adminService.marcarPrueba(props.order.id, !esPrueba.value)
    confirmando.value = null
    // La lista y los totales los recarga la vista: acá no se puede saber
    // cómo quedó el resumen completo.
    emit('cambiada')
  } catch (e: unknown) {
    fallo.value = (e as { message?: string }).message ?? 'No pudimos guardar el cambio'
  } finally {
    guardando.value = false
  }
}

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

    <div class="acciones">
      <button type="button" class="accion" @click="confirmando = 'prueba'">
        {{ esPrueba ? 'Devolver a producción' : 'Marcar como prueba' }}
      </button>
      <button type="button" class="accion accion--peligro" @click="confirmando = 'borrar'">
        Borrar compra
      </button>
      <p class="acciones__pista">
        Marcar como prueba la saca del recaudado sin perder el registro. Borrar no se deshace.
      </p>
    </div>

    <p v-if="fallo" class="fallo">{{ fallo }}</p>

    <ConfirmModal
      :open="confirmando === 'prueba'"
      :loading="guardando"
      :title="esPrueba ? 'Devolver a producción' : 'Marcar como prueba'"
      :message="
        esPrueba
          ? `Los ${usd(order.amountCents)} de ${order.buyerName || 'esta compra'} vuelven a contar como dinero recibido.`
          : `Los ${usd(order.amountCents)} de ${order.buyerName || 'esta compra'} dejan de contar como dinero recibido y pasan a Pruebas. El registro no se pierde y esto se puede revertir.`
      "
      :confirm-label="esPrueba ? 'Devolver' : 'Marcar como prueba'"
      @confirm="aplicar"
      @cancel="confirmando = null"
    />

    <ConfirmModal
      :open="confirmando === 'borrar'"
      :loading="guardando"
      danger
      title="Borrar esta compra"
      :message="`Se borra el registro de ${order.buyerName || 'esta compra'} (${order.email || 'sin correo'}, ${usd(order.amountCents)}) para siempre. Es el único rastro de quién compró y no se puede recuperar. Si solo quieres que no cuente como dinero, márcala como prueba.`"
      confirm-label="Borrar para siempre"
      @confirm="aplicar"
      @cancel="confirmando = null"
    />
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

/* ── Acciones ── */
.acciones {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.3rem;
  padding-top: 1rem;
  border-top: 1px solid rgba($ink, 0.08);
}

.accion {
  padding: 0.45rem 0.95rem;
  border: 1px solid rgba($ink, 0.16);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-soft;
  cursor: pointer;
  transition:
    border-color 0.25s $ease,
    color 0.25s $ease;

  &:hover {
    border-color: rgba($ink, 0.4);
    color: $ink;
  }
}

.accion--peligro:hover {
  border-color: $alert-error;
  color: $alert-error;
}

.acciones__pista {
  flex: 1 1 240px;
  font-size: $text-xs;
  color: $ink-muted;
}

.fallo {
  margin-top: 0.7rem;
  padding: 0.6rem 0.9rem;
  border-radius: $radius-md;
  background-color: $alert-error-bg;
  font-size: $text-xs;
  color: $alert-error;
}
</style>

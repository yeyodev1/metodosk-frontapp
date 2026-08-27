<script setup lang="ts">
/**
 * Los pagos de la alumna.
 *
 * Lo primero que quiere ver alguien que acaba de pagar $67 es la constancia de
 * que el cobro entró y hasta cuándo tiene acceso. La referencia se puede
 * copiar de un toque: es lo que le vamos a pedir si escribe con un problema.
 */
import { computed, onMounted, ref } from 'vue'
import paymentService, { type MiPago } from '@/services/paymentService'
import { useSessionStore } from '@/stores/session'

const session = useSessionStore()

const pagos = ref<MiPago[]>([])
const cargando = ref(true)
const error = ref('')
const copiada = ref('')

const usd = (centavos: number) => `$${(centavos / 100).toFixed(2)}`

const ESTADOS: Record<MiPago['status'], string> = {
  approved: 'Pagado',
  canceled: 'Cancelado',
  failed: 'No se completó',
}

function fecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const aprobado = computed(() => pagos.value.find((p) => p.status === 'approved') || null)

async function copiar(referencia: string) {
  try {
    await navigator.clipboard.writeText(referencia)
    copiada.value = referencia
    setTimeout(() => (copiada.value = ''), 2000)
  } catch {
    // Sin permiso de portapapeles no pasa nada: la referencia está a la vista.
  }
}

onMounted(async () => {
  try {
    if (!session.user) await session.restore()
    pagos.value = await paymentService.mine()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar tus pagos'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="pagos">
    <header class="pagos__head">
      <p class="pagos__eyebrow">Método SK</p>
      <h1 class="pagos__title">Mis pagos</h1>
      <p class="pagos__sub">Tu compra y hasta cuándo va tu acceso al reto.</p>
    </header>

    <!-- El acceso primero: es la pregunta que se viene a responder acá -->
    <section v-if="aprobado" class="acceso">
      <p class="acceso__badge">Acceso activo</p>
      <h2 class="acceso__reto">{{ aprobado.challenge || 'Tu reto' }}</h2>
      <p class="acceso__hasta">
        Hasta el <strong>{{ fecha(aprobado.accessUntil) }}</strong>
      </p>
    </section>

    <p v-if="error" class="aviso aviso--error">{{ error }}</p>
    <p v-else-if="cargando" class="aviso">Cargando tus pagos…</p>

    <p v-else-if="!pagos.length" class="aviso">
      No encontramos pagos con tu correo. Si compraste con otro, escríbenos y lo unimos a esta
      cuenta.
    </p>

    <ul v-else class="lista">
      <li v-for="p in pagos" :key="p.id" class="pago">
        <div class="pago__fila">
          <span class="pago__monto">{{ usd(p.amountCents) }}</span>
          <span :class="['pago__estado', `pago__estado--${p.status}`]">
            {{ ESTADOS[p.status] }}
          </span>
        </div>

        <dl class="pago__datos">
          <div>
            <dt>Reto</dt>
            <dd>{{ p.challenge || '—' }}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{{ fecha(p.createdAt) }}</dd>
          </div>
          <div>
            <dt>Acceso hasta</dt>
            <dd>{{ fecha(p.accessUntil) }}</dd>
          </div>
        </dl>

        <button type="button" class="pago__ref" @click="copiar(p.referencia)">
          <span class="pago__ref-label">Referencia</span>
          <span class="pago__ref-valor">{{ p.referencia }}</span>
          <span class="pago__ref-copia">{{ copiada === p.referencia ? 'Copiada' : 'Copiar' }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.pagos {
  padding: clamp(1.2rem, 3vw, 2.5rem) clamp(1rem, 3vw, 2.5rem) 4rem;
  padding-top: 4.2rem;

  @include from('lg') {
    padding-top: clamp(1.5rem, 3vw, 2.5rem);
  }
}

.pagos__head {
  margin-bottom: $space-md;
}

.pagos__eyebrow {
  @include eyebrow;
}

.pagos__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.pagos__sub {
  margin-top: 0.3rem;
  font-size: $text-sm;
  color: $ink-soft;
}

.acceso {
  margin-bottom: $space-md;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  border-radius: $radius-lg;
  background-color: $ink;
  color: $cream;
}

.acceso__badge {
  @include eyebrow;
  color: $rose-soft;
}

.acceso__reto {
  font-family: $font-display;
  font-size: $text-xl;
  color: $cream;
}

.acceso__hasta {
  margin-top: 0.2rem;
  font-size: $text-sm;
  color: rgba($cream, 0.68);

  strong {
    color: $cream;
  }
}

.aviso {
  padding: $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}

.aviso--error {
  background-color: $alert-error-bg;
  color: $alert-error;
}

.lista {
  display: grid;
  gap: $space-sm;
  list-style: none;

  @include from('lg') {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

.pago {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: clamp(1.1rem, 3vw, 1.4rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.pago__fila {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
}

.pago__monto {
  font-family: $font-display;
  font-size: 1.7rem;
  color: $ink;
}

.pago__estado {
  padding: 0.25rem 0.7rem;
  border-radius: $radius-pill;
  font-size: $text-xs;
  white-space: nowrap;
}

.pago__estado--approved {
  background-color: $alert-success-bg;
  color: #4a7a45;
}

.pago__estado--canceled,
.pago__estado--failed {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}

.pago__datos {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));

  dt {
    font-size: $text-xs;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  dd {
    margin-top: 0.1rem;
    font-size: $text-sm;
    color: $ink;
  }
}

/* La referencia se copia de un toque: es lo que pedimos si algo sale mal */
.pago__ref {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  border: 1px dashed rgba($ink, 0.18);
  border-radius: $radius-sm;
  background: none;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.28s $ease, background-color 0.28s $ease;

  &:hover {
    border-color: rgba($ink, 0.4);
    background-color: rgba($sand, 0.4);
  }

  @include focus-ring;
}

.pago__ref-label {
  flex: none;
  font-size: $text-xs;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $ink-muted;
}

.pago__ref-valor {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: $text-xs;
  color: $ink;
}

.pago__ref-copia {
  flex: none;
  font-size: $text-xs;
  color: $rose-deep;
}
</style>

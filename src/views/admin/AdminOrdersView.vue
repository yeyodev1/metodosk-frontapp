<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import adminService, { type AdminOrder, type OrdersResponse } from '@/services/adminService'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()

const data = ref<OrdersResponse | null>(null)
const loading = ref(false)
const error = ref('')
const search = ref('')
const status = ref('')

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`

const recaudado = computed(() => usd(data.value?.resumen.recaudadoCentavos ?? 0))

const ESTADOS: Record<AdminOrder['status'], string> = {
  approved: 'Aprobada',
  canceled: 'Cancelada',
  failed: 'Fallida',
}

function fecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

let debounce: ReturnType<typeof setTimeout> | null = null
watch([search, status], () => {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(load, 300)
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await adminService.orders({
      search: search.value.trim() || undefined,
      status: status.value || undefined,
    })
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string }
    if (err.status === 401) {
      session.clear()
      return router.replace('/login')
    }
    error.value = err.message ?? 'No pudimos cargar las compras'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="compras">
    <header class="compras__head">
      <div>
        <p class="compras__eyebrow">Administración</p>
        <h1 class="compras__title">Compras</h1>
      </div>
      <p v-if="data" class="compras__meta">
        {{ data.orders.length }}
        {{ data.orders.length === 1 ? 'compra listada' : 'compras listadas' }}
      </p>
    </header>

    <section v-if="data" class="cards">
      <div class="card">
        <span class="card__value">{{ data.resumen.total }}</span>
        <span class="card__label">Registradas</span>
      </div>
      <div class="card">
        <span class="card__value">{{ data.resumen.aprobadas }}</span>
        <span class="card__label">Aprobadas</span>
      </div>
      <div class="card card--fuerte">
        <span class="card__value">{{ recaudado }}</span>
        <span class="card__label">Recaudado · solo pagos reales</span>
      </div>
    </section>

    <div class="filtros">
      <input v-model="search" type="search" placeholder="Buscar por nombre, correo o referencia" />
      <select v-model="status">
        <option value="">Todos los estados</option>
        <option value="approved">Aprobadas</option>
        <option value="canceled">Canceladas</option>
        <option value="failed">Fallidas</option>
      </select>
    </div>

    <p v-if="error" class="compras__error">{{ error }}</p>
    <p v-else-if="loading" class="compras__empty">Cargando…</p>
    <p v-else-if="!data?.orders.length" class="compras__empty">
      Todavía no hay compras registradas.
    </p>

    <div v-else class="tabla-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th>Compradora</th>
            <th>Reto</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Acceso hasta</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in data.orders" :key="o.id">
            <td>
              <strong>{{ o.buyerName || '—' }}</strong>
              <span class="sub">{{ o.email || 'sin correo' }}</span>
              <span v-if="o.phoneNumber" class="sub">{{ o.phoneNumber }}</span>
            </td>
            <td>
              {{ o.challenge || '—' }}
              <span v-if="o.environment === 'test'" class="tag tag--test">prueba</span>
            </td>
            <td>
              {{ usd(o.amountCents) }}
              <span v-if="!o.amountVerified" class="tag tag--warn" title="No coincide con ningún precio nuestro">
                revisar
              </span>
            </td>
            <td>
              <span :class="['estado', `estado--${o.status}`]">{{ ESTADOS[o.status] }}</span>
            </td>
            <td>{{ fecha(o.accessUntil) }}</td>
            <td>{{ fecha(o.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.compras {
  max-width: 1180px;
  padding: clamp(1.5rem, 4vw, 3rem);
  padding-top: clamp(4.2rem, 8vw, 3rem);
}

.compras__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-sm;
  margin-bottom: $space-md;
}

.compras__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.compras__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.compras__meta {
  font-size: $text-xs;
  color: $ink-muted;
}

/* ── Resumen ── */
.cards {
  display: flex;
  flex-wrap: wrap;
  gap: $space-sm;
  margin-bottom: $space-md;
}

.card {
  flex: 1 1 190px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 1.1rem 1.3rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.card--fuerte {
  background-color: $ink;

  .card__value {
    color: $cream;
  }

  .card__label {
    color: rgba($cream, 0.55);
  }
}

.card__value {
  font-family: $font-display;
  font-size: 1.9rem;
  line-height: 1.1;
  color: $ink;
}

.card__label {
  font-size: $text-xs;
  color: $ink-muted;
}

/* ── Filtros ── */
.filtros {
  display: flex;
  gap: 0.6rem;
  margin-bottom: $space-md;
  flex-wrap: wrap;

  input,
  select {
    padding: 0.75rem 1rem;
    border: 1px solid rgba($ink, 0.14);
    border-radius: $radius-pill;
    background-color: $cream;
    font-family: inherit;
    font-size: $text-sm;
    color: $ink;
    transition: border-color 0.3s $ease;

    &:focus {
      border-color: rgba($ink, 0.4);
      outline: none;
    }
  }

  input {
    flex: 1 1 280px;
  }
}

.compras__empty,
.compras__error {
  padding: $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}

.compras__error {
  background-color: $alert-error-bg;
  color: $alert-error;
}

/* ── Tabla ── */
.tabla-wrap {
  overflow-x: auto;
  border-radius: $radius-lg;
  background-color: $cream;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: $text-sm;

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 0.9rem 1.1rem;
    text-align: left;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $ink-muted;
    background-color: $cream;
    border-bottom: 1px solid rgba($ink, 0.1);
    white-space: nowrap;
  }

  td {
    padding: 0.95rem 1.1rem;
    border-bottom: 1px solid rgba($ink, 0.06);
    color: $ink;
    vertical-align: top;
    white-space: nowrap;
  }

  tbody tr {
    transition: background-color 0.25s $ease;

    &:hover {
      background-color: rgba($sand, 0.5);
    }
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.sub {
  display: block;
  font-size: $text-xs;
  color: $ink-muted;
}

.tag {
  display: inline-block;
  margin-left: 0.35rem;
  padding: 0.1rem 0.45rem;
  border-radius: $radius-pill;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tag--test {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}

.tag--warn {
  background-color: $alert-error-bg;
  color: $alert-error;
}

.estado {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: $radius-pill;
  font-size: $text-xs;
  white-space: nowrap;
}

.estado--approved {
  background-color: $alert-success-bg;
  color: #4a7a45;
}

.estado--canceled,
.estado--failed {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}
</style>

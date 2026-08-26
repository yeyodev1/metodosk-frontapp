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
  <main class="panel">
    <header class="panel__head">
      <div>
        <p class="panel__eyebrow">Administración</p>
        <h1 class="panel__title">Compras</h1>
      </div>
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
      <div class="card">
        <span class="card__value">{{ recaudado }}</span>
        <span class="card__label">Recaudado (real)</span>
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

    <p v-if="error" class="panel__error">{{ error }}</p>
    <p v-else-if="loading" class="panel__empty">Cargando…</p>
    <p v-else-if="!data?.orders.length" class="panel__empty">
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
.panel {
  padding: clamp(1.5rem, 5vw, 3rem);
  padding-top: clamp(4.2rem, 8vw, 3rem);
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: $space-md;
}

.panel__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.panel__title {
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: $space-sm;
  margin-bottom: $space-md;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1.1rem 1.2rem;
  border-radius: $radius-md;
  background-color: $cream;
}

.card__value {
  font-family: $font-display;
  font-size: 1.7rem;
  color: $ink;
}

.card__label {
  font-size: $text-xs;
  color: $ink-muted;
}

.filtros {
  display: flex;
  gap: 0.6rem;
  margin-bottom: $space-md;
  flex-wrap: wrap;

  input,
  select {
    padding: 0.7rem 0.9rem;
    border: 1px solid rgba($ink, 0.16);
    border-radius: $radius-sm;
    background-color: $cream;
    font-family: inherit;
    font-size: $text-sm;
    color: $ink;
  }

  input {
    flex: 1 1 260px;
  }
}

.panel__empty,
.panel__error {
  padding: $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}

.panel__error {
  color: $alert-error;
}

.tabla-wrap {
  overflow-x: auto;
  border-radius: $radius-md;
  background-color: $cream;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: $text-sm;

  th {
    padding: 0.9rem 1rem;
    text-align: left;
    font-size: $text-xs;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $ink-muted;
    border-bottom: 1px solid rgba($ink, 0.1);
    white-space: nowrap;
  }

  td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid rgba($ink, 0.06);
    color: $ink;
    vertical-align: top;
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
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tag--test {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}

.tag--warn {
  background-color: rgba($alert-error, 0.12);
  color: $alert-error;
}

.estado {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: $radius-pill;
  font-size: $text-xs;
}

.estado--approved {
  background-color: rgba(#1b7f4d, 0.12);
  color: #1b7f4d;
}

.estado--canceled,
.estado--failed {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}
</style>

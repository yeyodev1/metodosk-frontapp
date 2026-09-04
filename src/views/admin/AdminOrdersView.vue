<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import OrdersSummary from '@/components/admin/OrdersSummary.vue'
import OrderDetail from '@/components/admin/OrderDetail.vue'
import adminService, {
  type AdminOrder,
  type OrderGrupo,
  type OrdersResponse,
} from '@/services/adminService'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const session = useSessionStore()

const data = ref<OrdersResponse | null>(null)
const loading = ref(false)
const error = ref('')
const search = ref('')
const status = ref('')
/** Qué compras tienen el detalle desplegado. */
const abiertas = ref<Set<string>>(new Set())

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`

const ESTADOS_FILTRO = [
  { value: '', label: 'Todos los estados' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'canceled', label: 'Canceladas' },
  { value: 'failed', label: 'Fallidas' },
]

const ESTADOS: Record<AdminOrder['status'], string> = {
  approved: 'Aprobada',
  canceled: 'Cancelada',
  failed: 'Fallida',
}

/** Cómo se nombra cada grupo en la tabla, y qué significa en dinero. */
const GRUPOS: Record<OrderGrupo, { etiqueta: string; explica: string }> = {
  entro: { etiqueta: 'Cobrada', explica: 'PayPhone cobró este dinero: sí entró a la cuenta.' },
  porRevisar: {
    etiqueta: 'Cobrada · revisar',
    explica: 'El cobro sí entró, pero por un valor que no es ninguno de nuestros precios.',
  },
  pruebas: {
    etiqueta: 'Prueba',
    explica: 'Pago hecho con las credenciales de prueba: no movió dinero real.',
  },
  noEntro: { etiqueta: 'No se cobró', explica: 'El intento se canceló o falló. No entró nada.' },
}

function fecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function alternar(id: string) {
  const siguiente = new Set(abiertas.value)
  if (siguiente.has(id)) siguiente.delete(id)
  else siguiente.add(id)
  abiertas.value = siguiente
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
    // Lo desplegado pertenecía a filas que quizá ya no están listadas.
    abiertas.value = new Set()
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
        <p class="compras__sub">Cada intento de pago por PayPhone, y cuál se cobró de verdad.</p>
      </div>
      <p v-if="data" class="compras__meta">
        Mostrando {{ data.resumen.mostradas }} de {{ data.resumen.registradas }}
      </p>
    </header>

    <OrdersSummary v-if="data" :resumen="data.resumen" :precios="data.precios" />

    <div class="filtros">
      <input v-model="search" type="search" placeholder="Buscar por nombre, correo o referencia" />
      <BaseSelect v-model="status" :options="ESTADOS_FILTRO" />
    </div>

    <p v-if="error" class="compras__error">{{ error }}</p>
    <p v-else-if="loading" class="compras__empty">Cargando…</p>
    <p v-else-if="!data?.orders.length" class="compras__empty">No hay compras que coincidan.</p>

    <div v-else class="tabla-wrap">
      <table class="tabla">
        <thead>
          <tr>
            <th>Compradora</th>
            <th>Reto</th>
            <th>Monto</th>
            <th>¿Entró el dinero?</th>
            <th>Acceso hasta</th>
            <th>Fecha</th>
            <th><span class="oculto">Detalle</span></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="o in data.orders" :key="o.id">
            <tr :class="{ 'fila--abierta': abiertas.has(o.id) }">
              <td>
                <strong>{{ o.buyerName || '—' }}</strong>
                <span class="sub">{{ o.email || 'sin correo' }}</span>
                <span v-if="o.phoneNumber" class="sub">{{ o.phoneNumber }}</span>
              </td>
              <td>{{ o.challenge || '—' }}</td>
              <td>
                <span :class="{ 'monto--nulo': o.grupo === 'noEntro' || o.grupo === 'pruebas' }">
                  {{ usd(o.amountCents) }}
                </span>
              </td>
              <td>
                <span :class="['estado', `estado--${o.grupo}`]" :title="GRUPOS[o.grupo].explica">
                  {{ GRUPOS[o.grupo].etiqueta }}
                </span>
              </td>
              <td>{{ fecha(o.accessUntil) }}</td>
              <td>{{ fecha(o.createdAt) }}</td>
              <td class="celda-accion">
                <button
                  type="button"
                  class="ver"
                  :aria-expanded="abiertas.has(o.id)"
                  @click="alternar(o.id)"
                >
                  {{ abiertas.has(o.id) ? 'Ocultar' : 'Detalle' }}
                </button>
              </td>
            </tr>
            <tr v-if="abiertas.has(o.id)" class="fila-detalle">
              <td colspan="7">
                <OrderDetail
                  :order="o"
                  :estado="ESTADOS[o.status]"
                  :explica="GRUPOS[o.grupo].explica"
                />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.compras {
  padding: 0;
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

.compras__sub {
  margin-top: 0.3rem;
  font-size: $text-sm;
  color: $ink-soft;
}

.compras__meta {
  font-size: $text-xs;
  color: $ink-muted;
}

/* ── Filtros ── */
.filtros {
  display: flex;
  gap: 0.6rem;
  margin-bottom: $space-md;
  flex-wrap: wrap;

  input {
    flex: 1 1 280px;
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

.oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.fila--abierta {
  background-color: rgba($sand, 0.5);

  td {
    border-bottom-color: transparent;
  }
}

.sub {
  display: block;
  font-size: $text-xs;
  color: $ink-muted;
}

/* Tachado: ese monto nunca llegó a la cuenta. */
.monto--nulo {
  color: $ink-muted;
  text-decoration: line-through;
}

.celda-accion {
  text-align: right;
}

.ver {
  padding: 0.3rem 0.75rem;
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

.fila-detalle {
  background-color: rgba($sand, 0.5);

  &:hover {
    background-color: rgba($sand, 0.5);
  }

  > td {
    padding: 0 1.1rem 1.2rem;
    white-space: normal;
  }
}

.estado {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: $radius-pill;
  font-size: $text-xs;
  white-space: nowrap;
}

.estado--entro {
  background-color: $alert-success-bg;
  color: #4a7a45;
}

.estado--porRevisar {
  background-color: $alert-error-bg;
  color: $alert-error;
}

.estado--pruebas,
.estado--noEntro {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}
</style>

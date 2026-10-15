<script setup lang="ts">
/**
 * Cupones de descuento.
 *
 * Se crea uno en tres decisiones (código, porcentaje, duración) y sale con su
 * link listo: `metodosk.ec/?cupon=CODIGO`. Quien entra por ese link ve el
 * descuento aplicado en toda la página y en el checkout, sin escribir nada.
 *
 * Arriba van los que están funcionando; los vencidos y pausados quedan abajo,
 * con sus ventas, porque sirven para comparar campañas.
 */
import { computed, onMounted, ref } from 'vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import CuponForm from '@/components/admin/CuponForm.vue'
import CuponCard from '@/components/admin/CuponCard.vue'
import cuponService, { type CuponAdmin, type DatosCupon } from '@/services/cuponService'
import { PRICES } from '@/config/payment'

const cupones = ref<CuponAdmin[]>([])
const baseCents = ref<number>(PRICES.regular)
const cargando = ref(true)
const error = ref('')

/** null = cerrado; 'nuevo' = creando; un cupón = editándolo. */
const formulario = ref<'nuevo' | CuponAdmin | null>(null)
const guardando = ref(false)
const errorForm = ref('')

const ORDEN = { activo: 0, programado: 1, agotado: 2, pausado: 3, vencido: 4 } as const

const ordenados = computed(() =>
  [...cupones.value].sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado] || b.createdAt.localeCompare(a.createdAt)),
)
const activos = computed(() => cupones.value.filter((c) => c.estado === 'activo').length)

const mensaje = (e: unknown, def: string) => (e as { message?: string })?.message || def

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const data = await cuponService.listar()
    cupones.value = data.cupones
    baseCents.value = data.baseCents
  } catch (e) {
    error.value = mensaje(e, 'No pudimos cargar los cupones')
  } finally {
    cargando.value = false
  }
}

function reemplazar(c: CuponAdmin) {
  const i = cupones.value.findIndex((x) => x.id === c.id)
  if (i >= 0) cupones.value.splice(i, 1, c)
  else cupones.value.unshift(c)
}

async function guardar(datos: DatosCupon) {
  guardando.value = true
  errorForm.value = ''
  try {
    const actual = formulario.value
    reemplazar(actual && actual !== 'nuevo' ? await cuponService.editar(actual.id, datos) : await cuponService.crear(datos))
    formulario.value = null
  } catch (e) {
    errorForm.value = mensaje(e, 'No pudimos guardar el cupón')
  } finally {
    guardando.value = false
  }
}

async function alternar(c: CuponAdmin) {
  try {
    reemplazar(await cuponService.editar(c.id, { active: !c.active }))
  } catch (e) {
    error.value = mensaje(e, 'No pudimos cambiar el cupón')
  }
}

const porEliminar = ref<CuponAdmin | null>(null)
const eliminando = ref(false)

async function eliminar() {
  const c = porEliminar.value
  if (!c) return
  eliminando.value = true
  try {
    await cuponService.eliminar(c.id)
    cupones.value = cupones.value.filter((x) => x.id !== c.id)
    porEliminar.value = null
  } catch (e) {
    error.value = mensaje(e, 'No pudimos eliminarlo')
  } finally {
    eliminando.value = false
  }
}

function abrir(que: 'nuevo' | CuponAdmin) {
  errorForm.value = ''
  formulario.value = que
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(cargar)
</script>

<template>
  <div class="cupones">
    <header class="cupones__head">
      <div>
        <p class="cupones__eyebrow">Administración</p>
        <h1 class="cupones__title">Cupones</h1>
        <p class="cupones__sub">
          Elige el porcentaje y cuánto dura. Cada cupón sale con su link: quien entra por él ya ve
          el descuento puesto.
        </p>
      </div>

      <button v-if="!formulario" type="button" class="nuevo" @click="abrir('nuevo')">
        <FaIcon icon="plus" /> Nuevo cupón
      </button>
    </header>

    <CuponForm
      v-if="formulario"
      :key="formulario === 'nuevo' ? 'nuevo' : formulario.id"
      :base-cents="baseCents"
      :cupon="formulario === 'nuevo' ? null : formulario"
      :guardando="guardando"
      :error="errorForm"
      @guardar="guardar"
      @cancelar="formulario = null"
    />

    <p v-if="error" class="aviso aviso--error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>
    <p v-if="cargando" class="aviso"><FaIcon icon="spinner" spin /> Cargando…</p>

    <div v-else-if="!cupones.length && !formulario" class="vacio">
      <FaIcon icon="ticket" class="vacio__icono" />
      <p>Todavía no hay cupones.</p>
      <button type="button" class="nuevo" @click="abrir('nuevo')"><FaIcon icon="plus" /> Crear el primero</button>
    </div>

    <template v-else-if="cupones.length">
      <p class="cupones__resumen">
        {{ activos }} {{ activos === 1 ? 'activo' : 'activos' }} de {{ cupones.length }}
      </p>
      <div class="lista">
        <CuponCard
          v-for="c in ordenados"
          :key="c.id"
          :cupon="c"
          @editar="abrir(c)"
          @alternar="alternar(c)"
          @eliminar="porEliminar = c"
        />
      </div>
    </template>

    <ConfirmModal
      :open="Boolean(porEliminar)"
      title="¿Eliminar el cupón?"
      :message="`El link con ${porEliminar?.code} deja de dar descuento. Las compras que ya se hicieron con él no se tocan. Si solo quieres frenarlo un tiempo, usa Pausar.`"
      confirm-label="Eliminar cupón"
      cancel-label="Cancelar"
      danger
      :loading="eliminando"
      @confirm="eliminar"
      @cancel="porEliminar = null"
    />
  </div>
</template>

<style lang="scss" scoped>
.cupones {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.cupones__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-sm;
}

.cupones__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.cupones__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.cupones__sub {
  max-width: 56ch;
  margin-top: 0.25rem;
  font-size: $text-sm;
  color: $ink-soft;
}

.cupones__resumen {
  font-size: $text-xs;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $ink-muted;
}

.nuevo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.3rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  cursor: pointer;

  @include focus-ring;
}

.lista {
  @include flex-cards(420px, 0.8rem);
}

.aviso {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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

.vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: $space-lg $space-md;
  border-radius: $radius-lg;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}

.vacio__icono {
  font-size: 1.8rem;
  color: $rose-deep;
}
</style>

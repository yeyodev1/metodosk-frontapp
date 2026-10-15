<script setup lang="ts">
/**
 * Crear o editar un cupón.
 *
 * Tres decisiones y nada más: el código, cuánto descuenta y cuánto dura. Todo
 * lo demás es opcional y va plegado. Al lado, en vivo, lo que va a ver la
 * compradora: el precio tachado, el nuevo y la fecha exacta de vencimiento,
 * para que nadie publique un cupón sin saber cuánto termina cobrando.
 */
import { computed, reactive, ref } from 'vue'
import { formatUsd } from '@/config/payment'
import type { CuponAdmin, DatosCupon } from '@/services/cuponService'
import { CODIGO_VALIDO, DURACIONES, PORCENTAJES, fechaLarga, vencimientoDe } from './cupones'

const props = defineProps<{
  baseCents: number
  /** Si llega, se edita ese cupón (el código queda fijo). */
  cupon?: CuponAdmin | null
  guardando?: boolean
  error?: string
}>()

const emit = defineEmits<{ guardar: [DatosCupon]; cancelar: [] }>()

const editando = computed(() => Boolean(props.cupon))

const form = reactive({
  code: props.cupon?.code ?? '',
  percent: props.cupon?.percent ?? 20,
  duracion: props.cupon ? 'mantener' : '7d',
  diasOtro: 10,
  maxUses: props.cupon?.maxUses ?? (null as number | null),
  note: props.cupon?.note ?? '',
})

const porcentajeOtro = ref(!PORCENTAJES.includes(form.percent as (typeof PORCENTAJES)[number]))
const masOpciones = ref(Boolean(props.cupon?.maxUses || props.cupon?.note))
const intentado = ref(false)

const finalCents = computed(() => Math.round((props.baseCents * (100 - (form.percent || 0))) / 100))

/** null = sin vencimiento; undefined = no se toca (edición). */
const endsAt = computed<Date | null | undefined>(() => {
  if (form.duracion === 'mantener') return undefined
  if (form.duracion === 'nunca') return null
  if (form.duracion === 'otro') return vencimientoDe(Math.max(1, Math.round(form.diasOtro || 1)))
  const d = DURACIONES.find((x) => x.id === form.duracion)
  return d?.dias ? vencimientoDe(d.dias) : null
})

const textoVence = computed(() => {
  if (endsAt.value === undefined) {
    return props.cupon?.endsAt ? `Sigue venciendo el ${fechaLarga(props.cupon.endsAt)}` : 'Sigue sin vencimiento'
  }
  return endsAt.value ? `Vence el ${fechaLarga(endsAt.value)}` : 'No vence: queda activo hasta que lo pauses'
})

const errores = computed(() => {
  const e: Record<string, string> = {}
  if (!editando.value && !CODIGO_VALIDO.test(form.code.trim())) {
    e.code = 'De 3 a 32 caracteres: letras, números, guion o guion bajo. Sin espacios.'
  }
  if (!Number.isInteger(form.percent) || form.percent < 1 || form.percent > 90) {
    e.percent = 'Un número entero entre 1 y 90'
  }
  if (form.duracion === 'otro' && !(form.diasOtro >= 1)) e.dias = 'Al menos 1 día'
  if (form.maxUses != null && !(Number.isInteger(form.maxUses) && form.maxUses >= 1)) {
    e.maxUses = 'Un número entero mayor a 0, o vacío para no poner límite'
  }
  return e
})

function elegirPorcentaje(p: number) {
  porcentajeOtro.value = false
  form.percent = p
}

function enviar() {
  intentado.value = true
  if (Object.keys(errores.value).length) return

  const datos: DatosCupon = {
    percent: form.percent,
    maxUses: form.maxUses || null,
    note: form.note.trim() || null,
  }
  if (!editando.value) datos.code = form.code.trim()
  if (endsAt.value !== undefined) datos.endsAt = endsAt.value ? endsAt.value.toISOString() : null
  emit('guardar', datos)
}
</script>

<template>
  <form class="cf" novalidate @submit.prevent="enviar">
    <div class="cf__campos">
      <div class="campo">
        <label for="cupon-code">Código del cupón</label>
        <input
          id="cupon-code"
          v-model="form.code"
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder="PrimerMesSk1000"
          :disabled="editando"
          :aria-invalid="intentado && Boolean(errores.code)"
        />
        <p v-if="editando" class="campo__pista">El código no se cambia: puede estar circulando en links.</p>
        <p v-else-if="intentado && errores.code" class="campo__error">{{ errores.code }}</p>
        <p v-else class="campo__pista">No importa si lo escriben con mayúsculas o minúsculas.</p>
      </div>

      <div class="campo">
        <span class="campo__label">Descuento</span>
        <div class="chips">
          <button
            v-for="p in PORCENTAJES"
            :key="p"
            type="button"
            class="chip"
            :class="{ 'chip--on': !porcentajeOtro && form.percent === p }"
            @click="elegirPorcentaje(p)"
          >
            {{ p }}%
          </button>
          <button type="button" class="chip" :class="{ 'chip--on': porcentajeOtro }" @click="porcentajeOtro = true">
            Otro
          </button>
          <span v-if="porcentajeOtro" class="otro">
            <input v-model.number="form.percent" type="number" min="1" max="90" step="1" aria-label="Porcentaje" />
            <span>%</span>
          </span>
        </div>
        <p v-if="intentado && errores.percent" class="campo__error">{{ errores.percent }}</p>
      </div>

      <div class="campo">
        <span class="campo__label">¿Cuánto dura?</span>
        <div class="chips">
          <button
            v-if="editando"
            type="button"
            class="chip"
            :class="{ 'chip--on': form.duracion === 'mantener' }"
            @click="form.duracion = 'mantener'"
          >
            Como está
          </button>
          <button
            v-for="d in DURACIONES"
            :key="d.id"
            type="button"
            class="chip"
            :class="{ 'chip--on': form.duracion === d.id }"
            @click="form.duracion = d.id"
          >
            {{ editando && d.dias ? `${d.label} desde hoy` : d.label }}
          </button>
          <button type="button" class="chip" :class="{ 'chip--on': form.duracion === 'otro' }" @click="form.duracion = 'otro'">
            Otro
          </button>
          <span v-if="form.duracion === 'otro'" class="otro">
            <input v-model.number="form.diasOtro" type="number" min="1" step="1" aria-label="Días" />
            <span>días</span>
          </span>
        </div>
        <p class="campo__vence">{{ textoVence }}</p>
      </div>

      <button type="button" class="cf__mas" @click="masOpciones = !masOpciones">
        {{ masOpciones ? 'Ocultar opciones' : 'Más opciones: límite de usos y nota' }}
      </button>

      <template v-if="masOpciones">
        <div class="campo">
          <label for="cupon-max">Límite de usos</label>
          <input id="cupon-max" v-model.number="form.maxUses" type="number" min="1" step="1" placeholder="Sin límite" />
          <p v-if="intentado && errores.maxUses" class="campo__error">{{ errores.maxUses }}</p>
          <p v-else class="campo__pista">Se cuentan solo las compras aprobadas con dinero real.</p>
        </div>
        <div class="campo">
          <label for="cupon-nota">Nota interna</label>
          <input id="cupon-nota" v-model="form.note" type="text" maxlength="140" placeholder="Ej.: campaña de octubre en historias" />
        </div>
      </template>
    </div>

    <aside class="cf__vista">
      <p class="cf__vista-eyebrow">Así lo ve la compradora</p>
      <p class="cf__vista-chip">
        <span>{{ form.code.trim() || 'TU-CUPON' }}</span><span>−{{ form.percent || 0 }}%</span>
      </p>
      <p class="cf__vista-monto">
        {{ formatUsd(finalCents) }} <s>{{ formatUsd(baseCents) }}</s>
      </p>
      <p class="cf__vista-ahorro">Ahorra {{ formatUsd(baseCents - finalCents) }}</p>
      <p class="cf__vista-vence">{{ textoVence }}</p>

      <p v-if="error" class="cf__error">{{ error }}</p>

      <div class="cf__acciones">
        <button type="submit" class="btn btn--primario" :disabled="guardando">
          {{ guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear cupón' }}
        </button>
        <button type="button" class="btn" @click="emit('cancelar')">Cancelar</button>
      </div>
    </aside>
  </form>
</template>

<style lang="scss" scoped>
.cf {
  display: flex;
  flex-wrap: wrap;
  gap: $space-md;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.cf__campos {
  flex: 1 1 360px;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  min-width: 0;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label,
  .campo__label {
    font-size: $text-xs;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  > input {
    padding: 0.8rem 1rem;
    border: 1px solid rgba($ink, 0.16);
    border-radius: $radius-sm;
    background-color: $bone;
    font-size: $text-base;

    &:focus {
      outline: none;
      border-color: $rose-deep;
      background-color: $white;
    }

    &:disabled {
      opacity: 0.6;
    }

    &[aria-invalid='true'] {
      border-color: $alert-error;
    }
  }
}

.campo__pista {
  font-size: $text-xs;
  color: $ink-muted;
}

.campo__error,
.cf__error {
  font-size: $text-xs;
  color: $alert-error;
}

.campo__vence {
  font-size: $text-sm;
  color: $ink;
  &::first-letter {
    text-transform: uppercase;
  }
}

.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.chip {
  padding: 0.5rem 0.95rem;
  border: 1px solid rgba($ink, 0.18);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-sm;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.2s $ease, border-color 0.2s $ease, color 0.2s $ease;

  &:hover {
    border-color: $ink;
  }

  @include focus-ring;
}

.chip--on {
  border-color: $ink;
  background-color: $ink;
  color: $cream;
}

.otro {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: $text-sm;
  color: $ink-soft;

  input {
    width: 4.5rem;
    padding: 0.45rem 0.6rem;
    border: 1px solid rgba($ink, 0.2);
    border-radius: $radius-sm;
    background-color: $white;
    font-size: $text-sm;
  }
}

.cf__mas {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: $text-sm;
  color: $rose-deep;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.cf__vista {
  flex: 1 1 260px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1.1rem, 3vw, 1.5rem);
  border-radius: $radius-md;
  background-color: $ink;
  color: rgba($cream, 0.75);
}

.cf__vista-eyebrow {
  @include eyebrow;
  color: $rose;
}

.cf__vista-chip {
  display: inline-flex;
  align-self: flex-start;
  overflow: hidden;
  border: 1px dashed rgba($rose, 0.7);
  border-radius: $radius-sm;
  font-size: $text-xs;
  font-weight: 600;

  span {
    padding: 0.3rem 0.6rem;
    color: $cream;
    overflow-wrap: anywhere;
  }

  span + span {
    background-color: $rose;
    color: $ink;
  }
}

.cf__vista-monto {
  font-family: $font-display;
  font-size: clamp(2rem, 5vw, 2.6rem);
  line-height: 1;
  color: $cream;

  s {
    font-family: $font-principal;
    font-size: $text-base;
    color: rgba($cream, 0.45);
  }
}

.cf__vista-ahorro {
  font-size: $text-sm;
  color: $rose-soft;
}

.cf__vista-vence {
  font-size: $text-xs;
  color: rgba($cream, 0.65);
}

.cf__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: $space-sm;
}

.btn {
  padding: 0.7rem 1.2rem;
  border: 1px solid rgba($cream, 0.35);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  @include focus-ring($rose);
}

.btn--primario {
  flex: 1 1 auto;
  border-color: $cream;
  background-color: $cream;
  color: $ink;
}
</style>

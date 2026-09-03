<script setup lang="ts">
/**
 * Sus medidas.
 *
 * Van junto a las fotos porque responden a la misma pregunta y se contestan el
 * mismo día. La cinta métrica es además lo que salva el mes en que la balanza
 * no se mueve: la cintura baja igual, y sin este número no habría con qué
 * demostrárselo.
 *
 * Todos los campos son opcionales a propósito. Exigir los seis para poder
 * guardar convierte una toma de dos minutos en un trámite, y quien no tiene
 * cinta a mano simplemente no apunta nada.
 */
import { computed, ref } from 'vue'
import onboardingService, {
  CAMPOS_MEDIDA,
  type ClaveMedida,
  type EstadoOnboarding,
} from '@/services/onboardingService'

const props = defineProps<{ estado: EstadoOnboarding }>()
const emit = defineEmits<{ actualizado: [EstadoOnboarding] }>()

type Formulario = Partial<Record<ClaveMedida, string>>

const abierto = ref(false)
const guardando = ref(false)
const error = ref('')
const form = ref<Formulario>({})

const ultima = computed(() => props.estado.medidas[0] ?? null)
const anterior = computed(() => props.estado.medidas[1] ?? null)

/** Cuánto se movió cada medida desde la toma anterior. */
function delta(clave: ClaveMedida): number | null {
  const hoy = ultima.value?.[clave]
  const antes = anterior.value?.[clave]
  if (hoy === null || hoy === undefined || antes === null || antes === undefined) return null
  return Math.round((hoy - antes) * 10) / 10
}

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })
}

function abrir() {
  // Se precarga con la última toma: se cambian dos números, no se reescriben seis.
  form.value = Object.fromEntries(
    CAMPOS_MEDIDA.map((c) => [c.clave, ultima.value?.[c.clave]?.toString() ?? '']),
  )
  abierto.value = true
}

async function guardar() {
  guardando.value = true
  error.value = ''
  try {
    const cuerpo = Object.fromEntries(
      CAMPOS_MEDIDA.map((c) => [c.clave, form.value[c.clave]?.trim() || null]),
    ) as Record<ClaveMedida, string | null>

    emit('actualizado', await onboardingService.guardarMedidas(cuerpo as never))
    abierto.value = false
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos guardarlas'
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <section class="med">
    <header class="med__head">
      <div>
        <h2 class="med__title"><FaIcon icon="chart-line" /> Tus medidas</h2>
        <p class="med__sub">
          <template v-if="ultima">Última toma: {{ fecha(ultima.createdAt) }}</template>
          <template v-else>Todavía no has apuntado ninguna. Apunta lo que tengas a mano.</template>
        </p>
      </div>
      <button v-if="!abierto" type="button" class="med__btn" @click="abrir">
        <FaIcon icon="check" /> {{ ultima ? 'Nueva toma' : 'Apuntar medidas' }}
      </button>
    </header>

    <!-- El formulario -->
    <form v-if="abierto" class="form" @submit.prevent="guardar">
      <div class="form__campos">
        <label v-for="c in CAMPOS_MEDIDA" :key="c.clave" class="campo">
          <span class="campo__label">{{ c.label }}</span>
          <span class="campo__caja">
            <input
              v-model="form[c.clave]"
              type="number"
              inputmode="decimal"
              :step="c.paso"
              placeholder="—"
            />
            <span class="campo__unidad">{{ c.unidad }}</span>
          </span>
        </label>
      </div>

      <p v-if="error" class="form__error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>

      <div class="form__acciones">
        <button type="submit" class="med__btn med__btn--solid" :disabled="guardando">
          <FaIcon :icon="guardando ? 'spinner' : 'check'" :spin="guardando" />
          Guardar
        </button>
        <button type="button" class="med__btn" @click="abierto = false">Cancelar</button>
      </div>
      <p class="form__nota">Deja en blanco lo que no midas. No hace falta llenar todo.</p>
    </form>

    <!-- La última toma, con el movimiento desde la anterior -->
    <div v-if="ultima" class="cifras">
      <div v-for="c in CAMPOS_MEDIDA" :key="c.clave" class="cifra">
        <p class="cifra__label">{{ c.label }}</p>
        <p class="cifra__valor">
          <template v-if="ultima[c.clave] !== null">
            {{ ultima[c.clave] }}<span class="cifra__unidad">{{ c.unidad }}</span>
          </template>
          <span v-else class="cifra__vacio">—</span>
        </p>
        <p
          v-if="delta(c.clave) !== null && delta(c.clave) !== 0"
          class="cifra__delta"
          :class="delta(c.clave)! < 0 ? 'cifra__delta--baja' : 'cifra__delta--sube'"
        >
          {{ delta(c.clave)! > 0 ? '+' : '' }}{{ delta(c.clave) }} {{ c.unidad }}
        </p>
      </div>
    </div>

    <p v-if="estado.medidas.length > 1" class="med__historico">
      <FaIcon icon="clock" /> Llevas {{ estado.medidas.length }} tomas apuntadas desde el
      {{ fecha(estado.medidas[estado.medidas.length - 1]!.createdAt) }}.
    </p>
  </section>
</template>

<style lang="scss" scoped>
.med {
  padding: clamp(1.1rem, 3vw, 1.6rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.med__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
}

.med__title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;

  svg {
    font-size: 0.8em;
    color: $rose-deep;
  }
}

.med__sub {
  margin-top: 0.25rem;
  font-size: $text-sm;
  color: $ink-soft;
}

.med__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-pill;
  background-color: transparent;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.26s $ease;

  &:hover {
    background-color: $rose-soft;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  @include focus-ring;
}

.med__btn--solid {
  border-color: $ink;
  background-color: $ink;
  color: $cream;

  &:hover {
    background-color: $wine;
    border-color: $wine;
  }
}

/* ── Formulario ── */
.form {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba($ink, 0.08);
}

.form__campos {
  @include flex-cards(110px, 0.7rem);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.campo__label {
  @include eyebrow;
  font-size: 0.62rem;
}

.campo__caja {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-sm;
  background-color: $bone;

  &:focus-within {
    border-color: $rose;
  }

  input {
    width: 100%;
    min-width: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: $text-sm;
    color: $ink;

    &:focus {
      outline: none;
    }
  }
}

.campo__unidad {
  flex: none;
  font-size: $text-xs;
  color: $ink-muted;
}

.form__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.9rem;
}

.form__nota {
  margin-top: 0.6rem;
  font-size: $text-xs;
  color: $ink-muted;
}

.form__error {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.7rem;
  font-size: $text-sm;
  color: $alert-error;
}

/* ── Las cifras ── */
.cifras {
  @include flex-cards(90px, 0.6rem);
  margin-top: 1rem;
}

.cifra {
  padding: 0.7rem 0.8rem;
  border-radius: $radius-sm;
  background-color: $bone;
}

.cifra__label {
  @include eyebrow;
  font-size: 0.6rem;
}

.cifra__valor {
  margin-top: 0.15rem;
  font-family: $font-display;
  font-size: $text-lg;
  line-height: 1.1;
  color: $ink;
}

.cifra__unidad {
  margin-left: 0.15rem;
  font-family: $font-principal;
  font-size: $text-xs;
  color: $ink-muted;
}

.cifra__vacio {
  color: rgba($ink, 0.22);
}

.cifra__delta {
  margin-top: 0.15rem;
  font-size: 0.66rem;
  font-weight: 600;
}

/* Bajar no siempre es "bueno" —depende del reto— así que se distinguen sin
   pintarlas de verde y rojo: el número informa, no felicita ni regaña. */
.cifra__delta--baja {
  color: $sage;
}

.cifra__delta--sube {
  color: $rose-deep;
}

.med__historico {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.9rem;
  font-size: $text-xs;
  color: $ink-muted;
}
</style>

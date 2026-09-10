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
 *
 * Lo que se pinta grande es la última toma con su movimiento desde la
 * anterior: ese "−1.5 cm" es la razón de existir del bloque. El historial va
 * debajo, plegado, porque se consulta rara vez y ocupa mucho.
 */
import { computed, ref } from 'vue'
import onboardingService, {
  CAMPOS_MEDIDA,
  type ClaveMedida,
  type EstadoOnboarding,
  type Medida,
} from '@/services/onboardingService'
import { PROGRESO } from '@/config/progreso'

const props = defineProps<{ estado: EstadoOnboarding }>()
const emit = defineEmits<{ actualizado: [EstadoOnboarding] }>()

const T = PROGRESO.medidas

type Formulario = Partial<Record<ClaveMedida, string>>

const abierto = ref(false)
const guardando = ref(false)
const error = ref('')
const form = ref<Formulario>({})

const ultima = computed(() => props.estado.medidas[0] ?? null)
const anterior = computed(() => props.estado.medidas[1] ?? null)

/** Las tomas de antes de la última, que es la que ya se ve arriba. */
const anteriores = computed(() => props.estado.medidas.slice(1))

/** El historial va plegado a tres: se consulta rara vez y ocupa mucho. */
const HISTORIAL_CORTO = 3
const historialAbierto = ref(false)
const historialVisible = computed(() =>
  historialAbierto.value ? anteriores.value : anteriores.value.slice(0, HISTORIAL_CORTO),
)

/** Cuánto se movió cada medida desde la toma anterior. */
function delta(clave: ClaveMedida): number | null {
  const hoy = ultima.value?.[clave]
  const antes = anterior.value?.[clave]
  if (hoy === null || hoy === undefined || antes === null || antes === undefined) return null
  return Math.round((hoy - antes) * 10) / 10
}

/**
 * Cómo se pinta el movimiento.
 *
 * Bajar cintura, cadera o pierna es lo que casi todas buscan y se marca
 * como avance. El peso no se juzga: en el reto de volumen sube a propósito,
 * y una flecha roja al lado del peso es lo último que necesita quien lo
 * está haciendo bien.
 */
function tonoDelta(clave: ClaveMedida, valor: number): 'avance' | 'neutro' | 'alerta' {
  if (clave === 'pesoKg' || clave === 'brazoCm' || clave === 'pechoCm') return 'neutro'
  return valor < 0 ? 'avance' : 'alerta'
}

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Guayaquil',
  })
}

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    timeZone: 'America/Guayaquil',
  })
}

/** Solo los campos que esa toma trae, para el historial compacto. */
function valoresDe(toma: Medida) {
  return CAMPOS_MEDIDA.filter((c) => toma[c.clave] !== null).map((c) => ({
    clave: c.clave,
    label: c.label,
    texto: `${toma[c.clave]} ${c.unidad}`,
  }))
}

function abrir() {
  // Se precarga con la última toma: se cambian dos números, no se reescriben seis.
  form.value = Object.fromEntries(
    CAMPOS_MEDIDA.map((c) => [c.clave, ultima.value?.[c.clave]?.toString() ?? '']),
  )
  error.value = ''
  abierto.value = true
}

function cerrar() {
  abierto.value = false
  error.value = ''
}

async function guardar() {
  guardando.value = true
  error.value = ''
  try {
    // Un input numérico entrega números, no texto, y "62,5" con coma es lo
    // normal acá: todo se normaliza a texto con punto antes de mandarlo.
    const cuerpo = Object.fromEntries(
      CAMPOS_MEDIDA.map((c) => {
        const crudo = String(form.value[c.clave] ?? '')
          .trim()
          .replace(',', '.')
        return [c.clave, crudo || null]
      }),
    ) as Record<ClaveMedida, string | null>

    emit('actualizado', await onboardingService.guardarMedidas(cuerpo as never))
    abierto.value = false
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? T.form.errorGenerico
  } finally {
    guardando.value = false
  }
}

/** Borrar una toma anterior. Se pregunta: no hay papelera de la que sacarla. */
const borrando = ref<string | null>(null)

async function borrar(toma: Medida) {
  if (!window.confirm(T.historial.confirmar)) return
  borrando.value = toma.createdAt
  error.value = ''
  try {
    emit('actualizado', await onboardingService.quitarMedidas(toma.createdAt))
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? T.form.errorGenerico
  } finally {
    borrando.value = null
  }
}
</script>

<template>
  <section class="med" :class="{ 'med--vacio': !ultima }">
    <!-- ── Cabecera ── -->
    <header class="med__head">
      <span class="med__icono"><FaIcon icon="ruler-combined" /></span>
      <div class="med__texto">
        <p class="med__eyebrow">{{ T.eyebrow }}</p>
        <h2 class="med__title">{{ T.titulo }}</h2>
        <p class="med__sub">
          {{ ultima ? T.ultimaToma(fecha(ultima.createdAt)) : T.sinTomas }}
        </p>
      </div>
      <button v-if="ultima && !abierto" type="button" class="med__nueva" @click="abrir">
        <FaIcon icon="plus" /> {{ T.ctaNueva }}
      </button>
    </header>

    <!-- ── Estado vacío: el punto cero ── -->
    <div v-if="!ultima && !abierto" class="vacio">
      <p class="vacio__title">{{ T.vacio.titulo }}</p>
      <p class="vacio__texto">{{ T.vacio.texto }}</p>
      <button type="button" class="cta" @click="abrir">
        <span class="cta__icono"><FaIcon icon="ruler-combined" /></span>
        <span class="cta__label">{{ T.ctaPrimera }}</span>
        <FaIcon icon="arrow-right" class="cta__flecha" />
      </button>
    </div>

    <!-- ── El formulario de la toma ── -->
    <Transition name="pliegue">
      <form v-if="abierto" class="form" novalidate @submit.prevent="guardar">
        <p class="form__title">{{ T.form.titulo }}</p>

        <div class="form__campos">
          <label
            v-for="(c, i) in CAMPOS_MEDIDA"
            :key="c.clave"
            class="campo"
            :style="{ '--i': i }"
          >
            <span class="campo__label">{{ c.label }}</span>
            <span class="campo__caja">
              <!-- Texto y no number: number rechaza "70,3" y bloquea el envío
                   por el "step" sin decir por qué; el servidor ya valida. -->
              <input
                v-model="form[c.clave]"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                placeholder="—"
              />
              <span class="campo__unidad">{{ c.unidad }}</span>
            </span>
          </label>
        </div>

        <p class="form__nota">{{ T.form.nota }}</p>

        <p v-if="error" class="form__error" role="alert">
          <FaIcon icon="triangle-exclamation" /> {{ error }}
        </p>

        <div class="form__acciones">
          <button type="submit" class="btn btn--solido" :disabled="guardando">
            <FaIcon :icon="guardando ? 'spinner' : 'check'" :spin="guardando" />
            {{ guardando ? T.form.guardando : T.form.guardar }}
          </button>
          <button type="button" class="btn" :disabled="guardando" @click="cerrar">
            {{ T.form.cancelar }}
          </button>
        </div>
      </form>
    </Transition>

    <!-- ── La última toma, con el movimiento desde la anterior ── -->
    <template v-if="ultima">
      <p class="cifras__title">{{ T.cifras.titulo }}</p>
      <ul class="cifras">
        <li v-for="(c, i) in CAMPOS_MEDIDA" :key="c.clave" class="cifra" :style="{ '--i': i }">
          <p class="cifra__label">{{ c.label }}</p>
          <p class="cifra__valor">
            <template v-if="ultima[c.clave] !== null">
              {{ ultima[c.clave] }}<span class="cifra__unidad">{{ c.unidad }}</span>
            </template>
            <span v-else class="cifra__vacio">—</span>
          </p>

          <!-- El movimiento: la razón de ser del bloque -->
          <p v-if="ultima[c.clave] === null" class="cifra__delta cifra__delta--muted">
            {{ T.cifras.sinDato }}
          </p>
          <p v-else-if="delta(c.clave) === null" class="cifra__delta cifra__delta--muted">
            {{ T.cifras.primera }}
          </p>
          <p v-else-if="delta(c.clave) === 0" class="cifra__delta cifra__delta--muted">
            {{ T.cifras.igual }}
          </p>
          <p
            v-else
            class="cifra__delta"
            :class="`cifra__delta--${tonoDelta(c.clave, delta(c.clave)!)}`"
          >
            <FaIcon :icon="delta(c.clave)! < 0 ? 'arrow-down' : 'arrow-up'" />
            {{ delta(c.clave)! > 0 ? '+' : '' }}{{ delta(c.clave) }} {{ c.unidad }}
          </p>
        </li>
      </ul>
    </template>

    <!-- ── Historial ── -->
    <div v-if="anteriores.length" class="historial">
      <p class="historial__title">
        <FaIcon icon="clock" /> {{ T.historial.titulo }}
      </p>

      <TransitionGroup name="fila" tag="ul" class="historial__lista">
        <li v-for="toma in historialVisible" :key="toma.createdAt" class="fila">
          <span class="fila__fecha">{{ fechaCorta(toma.createdAt) }}</span>
          <span class="fila__valores">
            <span v-for="v in valoresDe(toma)" :key="v.clave" class="fila__valor">
              <span class="fila__valor-label">{{ v.label }}</span> {{ v.texto }}
            </span>
          </span>
          <button
            type="button"
            class="fila__borrar"
            :disabled="borrando === toma.createdAt"
            :aria-label="T.historial.borrar"
            :title="T.historial.borrar"
            @click="borrar(toma)"
          >
            <FaIcon
              :icon="borrando === toma.createdAt ? 'spinner' : 'trash'"
              :spin="borrando === toma.createdAt"
            />
          </button>
        </li>
      </TransitionGroup>

      <button
        v-if="anteriores.length > HISTORIAL_CORTO"
        type="button"
        class="historial__mas"
        :aria-expanded="historialAbierto"
        @click="historialAbierto = !historialAbierto"
      >
        {{ historialAbierto ? T.historial.verMenos : T.historial.verTodas(anteriores.length) }}
        <FaIcon icon="chevron-down" :class="{ 'historial__chevron--abierto': historialAbierto }" />
      </button>

      <p v-if="error && !abierto" class="form__error" role="alert">
        <FaIcon icon="triangle-exclamation" /> {{ error }}
      </p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.med {
  padding: clamp(1.2rem, 3vw, 1.8rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

/* ── Cabecera ── */
.med__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem;
}

.med__icono {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-size: 1rem;
}

.med__texto {
  flex: 1 1 200px;
  min-width: 0;
}

.med__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.med__title {
  font-family: $font-display;
  font-size: 1.35rem;
  line-height: 1.2;
  color: $ink;
}

.med__sub {
  margin-top: 0.15rem;
  font-size: $text-sm;
  color: $ink-soft;
}

.med__nueva {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.2rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $cream;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color 0.26s $ease,
    transform 0.26s $ease;

  @include focus-ring;

  &:hover {
    background-color: $wine;
    transform: translateY(-1px);
  }
}

/* ── Estado vacío ── */
.vacio {
  margin-top: 1.2rem;
  padding: 1.3rem;
  border-radius: $radius-md;
  background-color: $ink;
  color: $cream;
}

.vacio__title {
  font-family: $font-display;
  font-size: $text-xl;
  line-height: 1.15;
}

.vacio__texto {
  max-width: 52ch;
  margin: 0.5rem 0 1.1rem;
  font-size: $text-sm;
  line-height: 1.6;
  color: rgba($cream, 0.75);
}

/* El mismo botón grande de "Tu próxima toma": una sola forma de decir "aquí". */
.cta {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  padding: 1rem 1.2rem;
  border: none;
  border-radius: $radius-lg;
  background-color: $rose-deep;
  color: $cream;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.26s $ease,
    transform 0.26s $ease,
    box-shadow 0.26s $ease;

  @include focus-ring($rose-soft);

  &:hover {
    background-color: $wine;
    transform: translateY(-2px);
    box-shadow: 0 14px 30px -12px rgba($rose-deep, 0.7);
  }
}

.cta__icono {
  display: grid;
  place-items: center;
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: rgba($cream, 0.16);
  font-size: 1.1rem;
}

.cta__label {
  flex: 1 1 auto;
  font-family: $font-display;
  font-size: 1.15rem;
  line-height: 1.15;
}

.cta__flecha {
  flex: none;
  transition: transform 0.26s $ease;

  .cta:hover & {
    transform: translateX(4px);
  }
}

/* ── Formulario ── */
.form {
  margin-top: 1.2rem;
  padding: 1.2rem;
  border-radius: $radius-md;
  background-color: $bone;
}

.form__title {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

/* Dos por fila en móvil, tres en ancho: seis campos, dos o tres líneas. */
.form__campos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 0.9rem;

  @include from('md') {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  animation: entrar 0.4s $ease both;
  animation-delay: calc(var(--i, 0) * 50ms);
}

.campo__label {
  @include eyebrow;
  font-size: 0.62rem;
  color: $ink-soft;
}

/* La caja es la que se ve como campo: el input va desnudo adentro para que
   el número y la unidad compartan el mismo borde y el mismo foco. */
.campo__caja {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.75rem 0.9rem;
  border: 1.5px solid rgba($ink, 0.1);
  border-radius: $radius-md;
  background-color: $cream;
  transition:
    border-color 0.2s $ease,
    box-shadow 0.2s $ease;

  &:focus-within {
    border-color: $rose-deep;
    box-shadow: 0 0 0 3px rgba($rose-deep, 0.18);
  }

  input {
    width: 100%;
    min-width: 0;
    border: none;
    background: none;
    font-family: $font-display;
    font-size: 1.4rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: $ink;

    &::placeholder {
      color: rgba($ink, 0.25);
    }

    &:focus {
      outline: none;
    }
  }
}

.campo__unidad {
  flex: none;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-muted;
}

.form__nota {
  margin-top: 0.8rem;
  font-size: $text-xs;
  color: $ink-muted;
}

.form__error {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.7rem;
  padding: 0.6rem 0.8rem;
  border-radius: $radius-sm;
  background-color: $alert-error-bg;
  font-size: $text-sm;
  color: $alert-error;
}

.form__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.75rem 1.3rem;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-pill;
  background-color: transparent;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $ink;
  cursor: pointer;
  transition:
    background-color 0.26s $ease,
    border-color 0.26s $ease;

  @include focus-ring;

  &:hover:not(:disabled) {
    background-color: $rose-soft;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.btn--solido {
  border-color: $ink;
  background-color: $ink;
  color: $cream;

  &:hover:not(:disabled) {
    background-color: $wine;
    border-color: $wine;
  }
}

/* Abrir y cerrar el formulario: aparece desde arriba, sin salto seco. */
.pliegue-enter-active,
.pliegue-leave-active {
  transition:
    opacity 0.32s $ease,
    transform 0.32s $ease;
}

.pliegue-enter-from,
.pliegue-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Las cifras ── */
.cifras__title {
  @include eyebrow;
  margin-top: 1.4rem;
  color: $ink-soft;
}

.cifras {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 0.7rem;
  list-style: none;

  @include from('md') {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @include from('lg') {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
}

.cifra {
  padding: 0.9rem 1rem;
  border-radius: $radius-md;
  background-color: $bone;
  animation: entrar 0.45s $ease both;
  animation-delay: calc(var(--i, 0) * 60ms);
}

.cifra__label {
  @include eyebrow;
  font-size: 0.6rem;
  color: $ink-soft;
}

/* Tabular: el "62.5" y el "70" alinean igual y el ojo compara sin esfuerzo. */
.cifra__valor {
  margin-top: 0.3rem;
  font-family: $font-display;
  font-size: 1.7rem;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: $ink;
}

.cifra__unidad {
  margin-left: 0.2rem;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink-muted;
}

.cifra__vacio {
  color: rgba($ink, 0.22);
}

.cifra__delta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.5rem;
  padding: 0.15rem 0.5rem;
  border-radius: $radius-pill;
  font-size: 0.66rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;

  svg {
    font-size: 0.8em;
  }
}

/* Bajar cintura, cadera o pierna es avance; el peso no se juzga, y una
   subida donde se buscaba bajar solo se marca, sin regañar. */
.cifra__delta--avance {
  background-color: rgba($sage, 0.18);
  color: #5f6d59;
}

.cifra__delta--neutro {
  background-color: rgba($ink, 0.06);
  color: $ink-soft;
}

.cifra__delta--alerta {
  background-color: $rose-soft;
  color: $wine;
}

.cifra__delta--muted {
  padding-left: 0;
  background: none;
  font-weight: 500;
  color: $ink-muted;
}

/* ── Historial ── */
.historial {
  margin-top: 1.4rem;
  padding-top: 1.2rem;
  border-top: 1px solid rgba($ink, 0.08);
}

.historial__title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  @include eyebrow;
  color: $ink-soft;

  svg {
    font-size: 0.85em;
  }
}

.historial__lista {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.7rem;
  list-style: none;
}

.fila {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.6rem 0.8rem;
  border-radius: $radius-sm;
  background-color: $bone;
}

.fila__fecha {
  flex: none;
  width: 4.2rem;
  font-size: $text-xs;
  font-weight: 600;
  color: $ink;
}

.fila__valores {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.9rem;
  flex: 1 1 auto;
  min-width: 0;
  font-size: $text-xs;
  font-variant-numeric: tabular-nums;
  color: $ink-soft;
}

.fila__valor-label {
  color: $ink-muted;
}

.fila__borrar {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: none;
  font-size: 0.75rem;
  color: $ink-muted;
  cursor: pointer;
  transition:
    background-color 0.2s $ease,
    color 0.2s $ease;

  @include focus-ring;

  &:hover:not(:disabled) {
    background-color: $alert-error-bg;
    color: $alert-error;
  }

  &:disabled {
    cursor: wait;
  }
}

.historial__mas {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.7rem;
  padding: 0;
  border: none;
  background: none;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
  color: $rose-deep;
  cursor: pointer;

  @include focus-ring;

  svg {
    transition: transform 0.26s $ease;
  }
}

.historial__chevron--abierto {
  transform: rotate(180deg);
}

/* Filas que entran y salen del historial al plegar o borrar. */
.fila-enter-active,
.fila-leave-active {
  transition:
    opacity 0.28s $ease,
    transform 0.28s $ease;
}

.fila-enter-from,
.fila-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@keyframes entrar {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@include reduced-motion {
  .campo,
  .cifra {
    animation: none;
  }

  .pliegue-enter-active,
  .pliegue-leave-active,
  .fila-enter-active,
  .fila-leave-active,
  .historial__mas svg,
  .cta,
  .cta__flecha,
  .med__nueva {
    transition: none;
  }
}
</style>

<script setup lang="ts">
/**
 * "En cuánto tiempo" — lo primero que se pregunta al entrar acá.
 *
 * La cuenta la hace el servidor, no esta pantalla: si la hiciera el navegador,
 * el reloj del teléfono decidiría cuándo toca la siguiente foto. Acá solo se
 * pinta un reloj corriendo hacia la fecha que el servidor mandó.
 *
 * Tres estados, tres pesos visuales: sin fotos y "hoy toca" van en oscuro
 * con el botón grande, porque hay algo que hacer ahora; "faltan días" va en
 * claro con el contador, porque lo único que hay que hacer es esperar.
 */
import { computed, onMounted, ref } from 'vue'
import type { EstadoOnboarding } from '@/services/onboardingService'
import { useCuentaRegresiva } from '@/composables/useCuentaRegresiva'
import { PROGRESO } from '@/config/progreso'

const props = defineProps<{ estado: EstadoOnboarding }>()

/** Quien escucha decide a dónde llevar: acá no se sabe dónde está el uploader. */
const emit = defineEmits<{ subir: [] }>()

const dias = computed(() => props.estado.diasParaProxima)

/** Sin ninguna foto todavía no hay cuenta que hacer: hoy es el día uno. */
const arrancando = computed(() => dias.value === null)

/**
 * El reloj corre hacia la fecha del servidor. Si no hay fecha (arrancando),
 * se le da "ahora": queda cerrado y no se pinta.
 */
const { cerrada, dias: dRest, horas, minutos, segundos } = useCuentaRegresiva(
  props.estado.proximaToma ?? new Date().toISOString(),
)

const toca = computed(() => props.estado.tomaPendiente || dias.value === 0 || cerrada.value)

const modo = computed<'arrancando' | 'toca' | 'faltan'>(() => {
  if (arrancando.value) return 'arrancando'
  if (toca.value) return 'toca'
  return 'faltan'
})

/** La barra: cuánto del mes va corrido. */
const avance = computed(() => {
  if (arrancando.value) return 0
  if (toca.value) return 100
  const total = props.estado.diasEntreTomas
  return Math.round(((total - (dias.value ?? 0)) / total) * 100)
})

/**
 * La barra arranca en cero y crece hasta su valor real al montar: ver el mes
 * llenarse dice más que verlo ya lleno.
 */
const barraLista = ref(false)
onMounted(() => {
  requestAnimationFrame(() => (barraLista.value = true))
})

/** "Jueves 9 de octubre", en la zona del reto para que no cambie según el celular. */
const fecha = computed(() => {
  if (!props.estado.proximaToma) return null
  const texto = new Date(props.estado.proximaToma).toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Guayaquil',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1).replace(',', '')
})

const dosDigitos = (n: number) => String(n).padStart(2, '0')
const E = PROGRESO.faltan.etiquetas

/** Los días se muestran siempre, aunque sean 0: acá el cero cuenta. */
const cajas = computed(() => [
  { valor: String(dRest.value), etiqueta: dRest.value === 1 ? E.dia : E.dias },
  { valor: dosDigitos(horas.value), etiqueta: E.horas },
  { valor: dosDigitos(minutos.value), etiqueta: E.minutos },
  { valor: dosDigitos(segundos.value), etiqueta: E.segundos },
])
</script>

<template>
  <section class="toma" :class="`toma--${modo}`">
    <!-- Arrancando / hoy toca: algo que hacer ahora -->
    <template v-if="modo !== 'faltan'">
      <header class="toma__head">
        <span class="toma__icono">
          <FaIcon icon="camera" />
          <span v-if="modo === 'toca'" class="toma__dot" aria-hidden="true" />
        </span>
        <div class="toma__texto">
          <p class="toma__eyebrow">{{ PROGRESO[modo].eyebrow }}</p>
          <h2 class="toma__title">{{ PROGRESO[modo].titulo }}</h2>
          <p class="toma__sub">{{ PROGRESO[modo].texto }}</p>
        </div>
      </header>

      <button type="button" class="cta" @click="emit('subir')">
        <span class="cta__icono"><FaIcon icon="camera" /></span>
        <span class="cta__label">{{ PROGRESO[modo].cta }}</span>
        <FaIcon icon="arrow-right" class="cta__flecha" />
      </button>
    </template>

    <!-- Faltan días: solo esperar, y ver el reloj -->
    <template v-else>
      <header class="toma__head">
        <span class="toma__icono"><FaIcon icon="clock" /></span>
        <div class="toma__texto">
          <p class="toma__eyebrow">{{ PROGRESO.faltan.eyebrow }}</p>
          <h2 class="toma__title">
            {{ PROGRESO.faltan.titulo }}
            <span class="toma__fecha-grande">{{ fecha }}</span>
          </h2>
          <p class="toma__sub">{{ PROGRESO.faltan.texto(estado.diasEntreTomas) }}</p>
        </div>
      </header>

      <ol class="cajas" :aria-label="`Faltan ${dRest} días, ${horas} horas y ${minutos} minutos`">
        <li v-for="c in cajas" :key="c.etiqueta" class="caja">
          <!-- Cada cambio de valor entra con un tic breve: se nota que corre, sin marear. -->
          <Transition name="tic" mode="out-in">
            <span :key="c.valor" class="caja__valor">{{ c.valor }}</span>
          </Transition>
          <span class="caja__etiqueta">{{ c.etiqueta }}</span>
        </li>
      </ol>

      <div class="barra" role="presentation">
        <span class="barra__relleno" :style="{ width: barraLista ? `${avance}%` : '0%' }" />
      </div>
      <div class="toma__pie">
        <span class="toma__avance">{{ PROGRESO.faltan.barra(avance) }}</span>
        <button type="button" class="toma__link" @click="emit('subir')">
          {{ PROGRESO.faltan.ctaSecundario }} <FaIcon icon="arrow-right" />
        </button>
      </div>
    </template>
  </section>
</template>

<style lang="scss" scoped>
.toma {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: clamp(1.3rem, 3vw, 1.8rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

/* Hay algo que hacer hoy: se pinta como aviso, no como dato. */
.toma--arrancando,
.toma--toca {
  background-color: $ink;

  .toma__eyebrow {
    color: $rose-soft;
  }

  .toma__title {
    color: $cream;
  }

  .toma__sub {
    color: rgba($cream, 0.7);
  }

  .toma__icono {
    background-color: $rose-soft;
    color: $ink;
  }
}

.toma__head {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.toma__icono {
  position: relative;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
  font-size: 1.05rem;
}

/* El punto que late: "hoy", sin decirlo. */
.toma__dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border: 2px solid $ink;
  border-radius: 50%;
  background-color: $rose-deep;
  animation: latir 1.8s infinite;
}

.toma__texto {
  flex: 1 1 240px;
  min-width: 0;
}

.toma__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.toma__title {
  margin-top: 0.2rem;
  font-family: $font-display;
  font-size: clamp(1.35rem, 2.6vw, 1.7rem);
  line-height: 1.15;
  color: $ink;
}

/* La fecha es el dato: va grande y en su propia línea. */
.toma__fecha-grande {
  display: block;
  margin-top: 0.15rem;
  font-size: clamp(1.7rem, 4vw, 2.4rem);
  line-height: 1.05;
}

.toma__sub {
  max-width: 54ch;
  margin-top: 0.4rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

/* ── El botón grande ── */
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

/* ── El contador ── */
.cajas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  list-style: none;

  @include from('sm') {
    flex-wrap: nowrap;
  }
}

.caja {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1 1 calc(50% - 0.3rem);
  min-width: 0;
  padding: 0.9rem 0.6rem;
  border-radius: $radius-md;
  background-color: $bone;

  @include from('sm') {
    flex: 1 1 calc(25% - 0.45rem);
  }

  @include from('lg') {
    flex: 0 1 7rem;
    padding: 1rem 0.6rem;
  }
}

/* Tabular: sin esto el ancho baila a cada tic del segundero. */
.caja__valor {
  display: block;
  font-family: $font-display;
  font-size: clamp(1.9rem, 5vw, 2.6rem);
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: $ink;
}

.caja__etiqueta {
  margin-top: 0.4rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $rose-deep;
}

/* El tic: el número nuevo sube y entra; el viejo se va sin ruido. */
.tic-enter-active {
  transition:
    transform 0.18s $ease,
    opacity 0.18s $ease;
}

.tic-leave-active {
  transition: opacity 0.08s $ease;
}

.tic-enter-from {
  opacity: 0;
  transform: translateY(0.25em);
}

.tic-leave-to {
  opacity: 0;
}

/* ── La barra del mes ── */
.barra {
  height: 6px;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.09);
  overflow: hidden;
}

.barra__relleno {
  display: block;
  height: 100%;
  border-radius: $radius-pill;
  background-color: $rose-deep;
  transition: width 1.1s $ease;
}

.toma__pie {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
  margin-top: -0.4rem;
}

.toma__avance {
  font-size: $text-xs;
  color: $ink-muted;
}

/* Subir antes de tiempo es posible, pero no es lo que se empuja. */
.toma__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: none;
  background: none;
  font-size: $text-xs;
  font-weight: 600;
  color: $rose-deep;
  cursor: pointer;

  svg {
    font-size: 0.8em;
    transition: transform 0.26s $ease;
  }

  &:hover svg {
    transform: translateX(3px);
  }

  @include focus-ring;
}

@keyframes latir {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.35);
    opacity: 0.55;
  }
}

@include reduced-motion {
  .toma__dot,
  .cta,
  .cta__flecha,
  .barra__relleno,
  .tic-enter-active,
  .tic-leave-active {
    animation: none;
    transition: none;
  }
}
</style>

<script setup lang="ts">
/**
 * El antes y el después.
 *
 * Era lo único que justificaba pedirle las fotos y no existía: se subían, se
 * guardaban, y no había ninguna pantalla donde volver a verlas juntas.
 *
 * "Antes" es siempre la **primera** foto, no la del mes pasado: comparar con
 * la anterior esconde justo lo que costó tres meses. Y la barra deslizante no
 * es un adorno — dos fotos lado a lado se miran por separado; una encima de la
 * otra, con el corte moviéndose, se comparan de verdad.
 */
import { ref } from 'vue'
import { ETIQUETA_ANGULO, type Comparativa } from '@/services/onboardingService'

defineProps<{ comparativa: Comparativa[] }>()

/** Dónde está el corte de cada tarjeta, en porcentaje. */
const corte = ref<Record<string, number>>({})

function posicion(angulo: string) {
  return corte.value[angulo] ?? 50
}

function mover(angulo: string, valor: string | number) {
  corte.value[angulo] = Number(valor)
}

function cuando(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

function tiempo(dias: number) {
  if (dias < 31) return `${dias} días`
  const meses = Math.round(dias / 30)
  return meses === 1 ? '1 mes' : `${meses} meses`
}
</script>

<template>
  <section class="ad">
    <header class="ad__head">
      <h2 class="ad__title"><FaIcon icon="images" /> Antes y después</h2>
      <p class="ad__sub">
        Tu primera foto contra la más reciente. Arrastra la barra para pasar de una a la otra.
      </p>
    </header>

    <!-- Todavía no hay con qué comparar: se dice, no se esconde -->
    <div v-if="!comparativa.length" class="ad__vacio">
      <span class="ad__vacio-icono"><FaIcon icon="camera" /></span>
      <p class="ad__vacio-title">Falta tu segunda toma</p>
      <p class="ad__vacio-texto">
        Con una sola foto no hay comparación. Cuando subas la del próximo mes, acá vas a poder ver
        las dos juntas.
      </p>
    </div>

    <div v-else class="ad__lista">
      <article v-for="c in comparativa" :key="c.angulo" class="par">
        <header class="par__head">
          <p class="par__angulo">{{ ETIQUETA_ANGULO[c.angulo] }}</p>
          <p class="par__lapso"><FaIcon icon="clock" /> {{ tiempo(c.diasEntre) }} de diferencia</p>
        </header>

        <div class="par__marco">
          <!-- Debajo: el después. Encima, recortado: el antes. -->
          <img class="par__foto" :src="c.despues.url" alt="Tu foto más reciente" />
          <div
            class="par__capa"
            :style="{ clipPath: `inset(0 ${100 - posicion(c.angulo)}% 0 0)` }"
          >
            <img class="par__foto" :src="c.antes.url" alt="Tu primera foto" />
          </div>

          <span class="par__linea" :style="{ left: `${posicion(c.angulo)}%` }" aria-hidden="true">
            <span class="par__tirador"><FaIcon icon="arrow-left" /><FaIcon icon="arrow-right" /></span>
          </span>

          <span class="par__etiqueta par__etiqueta--antes">Antes · {{ cuando(c.antes.createdAt) }}</span>
          <span class="par__etiqueta par__etiqueta--despues">
            Ahora · {{ cuando(c.despues.createdAt) }}
          </span>

          <!--
            Un input range de verdad, no un arrastre a mano: se mueve con las
            flechas del teclado y el lector de pantalla lo anuncia solo.
          -->
          <input
            class="par__rango"
            type="range"
            min="0"
            max="100"
            :value="posicion(c.angulo)"
            :aria-label="`Comparar tu foto ${ETIQUETA_ANGULO[c.angulo].toLowerCase()}`"
            @input="mover(c.angulo, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.ad {
  padding: clamp(1.1rem, 3vw, 1.6rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.ad__head {
  margin-bottom: 1rem;
}

.ad__title {
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

.ad__sub {
  margin-top: 0.3rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

/* ── Sin segunda toma ── */
.ad__vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: clamp(1.4rem, 5vw, 2.2rem) 1rem;
  border: 1.5px dashed rgba($ink, 0.16);
  border-radius: $radius-md;
}

.ad__vacio-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-bottom: 0.7rem;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
}

.ad__vacio-title {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.ad__vacio-texto {
  max-width: 42ch;
  margin-top: 0.25rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

/* ── Los pares ── */
.ad__lista {
  @include flex-cards(260px, 1rem);
}

.par {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.par__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem;
}

.par__angulo {
  @include eyebrow;
  font-size: 0.66rem;
}

.par__lapso {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: $text-xs;
  color: $ink-muted;

  svg {
    font-size: 0.85em;
  }
}

.par__marco {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: $radius-md;
  overflow: hidden;
  background-color: $bone;
  touch-action: pan-y;
}

.par__foto {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* La capa del "antes" se recorta con clip-path, no encogiendo su ancho:
   encogiéndola, la foto de dentro se encogía con ella y la comparación
   quedaba entre una foto y una versión aplastada de la otra. */
.par__capa {
  position: absolute;
  inset: 0;
}

.par__linea {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background-color: rgba($cream, 0.9);
  pointer-events: none;
}

.par__tirador {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 38px;
  height: 38px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-color: $cream;
  box-shadow: $shadow-sm;
  font-size: 0.6rem;
  color: $ink;
}

.par__etiqueta {
  position: absolute;
  bottom: 0.55rem;
  padding: 0.22rem 0.6rem;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.7);
  font-size: 0.64rem;
  color: $cream;
  pointer-events: none;
}

.par__etiqueta--antes {
  left: 0.55rem;
}

.par__etiqueta--despues {
  right: 0.55rem;
}

/* El control real, invisible pero encima de todo: así funciona el arrastre,
   el teclado y el lector de pantalla sin escribir ninguno a mano. */
.par__rango {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  appearance: none;
  background: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 44px;
    height: 100%;
  }

  &::-moz-range-thumb {
    width: 44px;
    height: 100%;
    border: none;
  }
}

/* El foco tiene que verse. Va por el marco y no por hermanos del input: el
   input se pinta después de la línea, y "~" solo alcanza a lo que viene detrás. */
.par__marco:focus-within .par__tirador {
  outline: 2px solid $rose-deep;
  outline-offset: 3px;
}
</style>

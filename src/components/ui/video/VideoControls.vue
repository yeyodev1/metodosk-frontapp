<script setup lang="ts">
/**
 * La barra de controles, al estilo YouTube: la línea de avance arriba, que
 * engorda al pasar el mouse, y debajo los botones sobre un degradado.
 *
 * No tiene estado propio del video: pinta lo que le pasa el reproductor y le
 * avisa qué tocó la alumna. Así la lógica vive en un solo lugar.
 */
import { onBeforeUnmount, ref, watch } from 'vue'
import type { Calidad } from '@/composables/useHlsPlayer'
import VideoAjustes from './VideoAjustes.vue'
import { ICONOS, formatoTiempo } from './iconos'

const props = defineProps<{
  reproduciendo: boolean
  tiempo: number
  duracion: number
  cargado: number
  volumen: number
  silencio: boolean
  velocidad: number
  calidades: Calidad[]
  calidad: number
  completa: boolean
  hayPip: boolean
}>()

const emit = defineEmits<{
  alternar: []
  buscar: [segundos: number]
  saltar: [delta: number]
  volumen: [valor: number]
  silenciar: []
  velocidad: [valor: number]
  calidad: [indice: number]
  pantalla: []
  pip: []
  menu: [abierto: boolean]
}>()

const raiz = ref<HTMLElement | null>(null)
const barra = ref<HTMLElement | null>(null)
const arrastrando = ref(false)
/** Dónde está el puntero sobre la barra, de 0 a 1. */
const encima = ref<number | null>(null)
const menu = ref(false)

const pct = (s: number) => `${props.duracion ? Math.min(100, (s / props.duracion) * 100) : 0}%`

function proporcion(e: PointerEvent) {
  const r = barra.value!.getBoundingClientRect()
  return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
}

function bajar(e: PointerEvent) {
  arrastrando.value = true
  barra.value?.setPointerCapture(e.pointerId)
  emit('buscar', proporcion(e) * props.duracion)
}

function mover(e: PointerEvent) {
  encima.value = proporcion(e)
  if (arrastrando.value) emit('buscar', encima.value * props.duracion)
}

function soltar() {
  arrastrando.value = false
  encima.value = null
}

/* El menú se cierra al tocar cualquier otra parte, como cualquier menú. */
function fuera(e: PointerEvent) {
  if (raiz.value && !raiz.value.contains(e.target as Node)) menu.value = false
}

watch(menu, (abierto) => {
  emit('menu', abierto)
  if (abierto) window.addEventListener('pointerdown', fuera)
  else window.removeEventListener('pointerdown', fuera)
})

onBeforeUnmount(() => window.removeEventListener('pointerdown', fuera))
</script>

<template>
  <div ref="raiz" class="controles" @click.stop @pointerup.stop>
    <div
      ref="barra"
      class="barra"
      :class="{ 'barra--activa': arrastrando }"
      role="slider"
      aria-label="Avance del video"
      :aria-valuemin="0"
      :aria-valuemax="Math.round(duracion)"
      :aria-valuenow="Math.round(tiempo)"
      :aria-valuetext="`${formatoTiempo(tiempo)} de ${formatoTiempo(duracion)}`"
      @pointerdown="bajar"
      @pointermove="mover"
      @pointerup="soltar"
      @pointercancel="soltar"
      @pointerleave="!arrastrando && (encima = null)"
    >
      <div class="barra__pista">
        <div class="barra__cargado" :style="{ width: pct(cargado) }" />
        <div v-if="encima !== null" class="barra__encima" :style="{ width: `${encima * 100}%` }" />
        <div class="barra__visto" :style="{ width: pct(tiempo) }" />
      </div>
      <div class="barra__punto" :style="{ left: pct(tiempo) }" />
      <span
        v-if="encima !== null"
        class="barra__globo"
        :style="{ left: `clamp(24px, ${encima * 100}%, calc(100% - 24px))` }"
      >
        {{ formatoTiempo(encima * duracion) }}
      </span>
    </div>

    <div class="fila">
      <button
        type="button"
        class="boton"
        :aria-label="reproduciendo ? 'Pausar (k)' : 'Reproducir (k)'"
        @click="emit('alternar')"
      >
        <svg viewBox="0 0 24 24"><path :d="reproduciendo ? ICONOS.pausa : ICONOS.play" /></svg>
      </button>

      <button type="button" class="boton boton--salto" aria-label="Atrás 10 segundos (j)" @click="emit('saltar', -10)">
        <svg viewBox="0 0 24 24"><path :d="ICONOS.retroceder" /></svg>
        <span>10</span>
      </button>
      <button
        type="button"
        class="boton boton--salto boton--espejo"
        aria-label="Adelante 10 segundos (l)"
        @click="emit('saltar', 10)"
      >
        <svg viewBox="0 0 24 24"><path :d="ICONOS.retroceder" /></svg>
        <span>10</span>
      </button>

      <div class="volumen">
        <button
          type="button"
          class="boton"
          :aria-label="silencio ? 'Activar sonido (m)' : 'Silenciar (m)'"
          @click="emit('silenciar')"
        >
          <svg viewBox="0 0 24 24">
            <path :d="silencio || volumen === 0 ? ICONOS.silencio : ICONOS.volumen" />
          </svg>
        </button>
        <input
          class="volumen__nivel"
          type="range"
          min="0"
          max="1"
          step="0.05"
          aria-label="Volumen"
          :value="silencio ? 0 : volumen"
          :style="{ '--nivel': `${(silencio ? 0 : volumen) * 100}%` }"
          @input="emit('volumen', Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <span class="tiempo">
        {{ formatoTiempo(tiempo) }}<span class="tiempo__total"> / {{ formatoTiempo(duracion) }}</span>
      </span>

      <span class="fila__hueco" />

      <button
        type="button"
        class="boton boton--ajustes"
        :class="{ 'boton--girado': menu }"
        aria-label="Ajustes"
        :aria-expanded="menu"
        @click="menu = !menu"
      >
        <svg viewBox="0 0 24 24"><path :d="ICONOS.ajustes" /></svg>
        <span v-if="velocidad !== 1" class="boton__marca">{{ velocidad }}×</span>
      </button>

      <button v-if="hayPip" type="button" class="boton boton--pip" aria-label="Ventana flotante" @click="emit('pip')">
        <svg viewBox="0 0 24 24"><path :d="ICONOS.pip" /></svg>
      </button>

      <button
        type="button"
        class="boton"
        :aria-label="completa ? 'Salir de pantalla completa (f)' : 'Pantalla completa (f)'"
        @click="emit('pantalla')"
      >
        <svg viewBox="0 0 24 24"><path :d="completa ? ICONOS.salirCompleta : ICONOS.completa" /></svg>
      </button>

      <VideoAjustes
        v-if="menu"
        :velocidad="velocidad"
        :calidades="calidades"
        :calidad="calidad"
        @velocidad="emit('velocidad', $event)"
        @calidad="emit('calidad', $event)"
        @cerrar="menu = false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped src="./VideoControls.scss"></style>

<script setup lang="ts">
/**
 * Reproductor propio de las clases, con la marca y los gestos de YouTube.
 *
 * El de Bunny venía con su barra genérica y, dentro del popup, se sentía
 * chico y ajeno. Este usa el mismo video de Bunny por HLS, pero los controles
 * son nuestros: doble toque a los lados para saltar 10 segundos, espacio para
 * pausar, velocidad y calidad en el engranaje, pantalla completa de verdad.
 *
 * Si el video no puede reproducirse así en algún navegador, cae solo al
 * reproductor de Bunny y le pasa su marco al padre para seguir el avance.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useHlsPlayer } from '@/composables/useHlsPlayer'
import { usePantallaCompleta } from '@/composables/usePantallaCompleta'
import VideoControls from './VideoControls.vue'
import { ICONOS } from './iconos'

const props = withDefaults(
  defineProps<{
    src?: string | null
    embedUrl: string
    poster?: string | null
    desde?: number
    titulo: string
    autoplay?: boolean
  }>(),
  { src: null, poster: null, desde: 0, autoplay: false },
)

const emit = defineEmits<{
  progreso: [segundos: number, duracion: number | null]
  terminado: []
  marco: [iframe: HTMLIFrameElement | null]
}>()

const caja = ref<HTMLElement | null>(null)
const video = ref<HTMLVideoElement | null>(null)
const iframe = ref<HTMLIFrameElement | null>(null)
const { listo, fallo, calidades, calidad, cargar, elegirCalidad } = useHlsPlayer(video)
const usarMarco = computed(() => !props.src || fallo.value)

const reproduciendo = ref(false)
const empezo = ref(false)
const esperando = ref(false)
const tiempo = ref(props.desde)
const duracion = ref(0)
const cargado = ref(0)
const volumen = ref(1)
const silencio = ref(false)
const velocidad = ref(1)
const activo = ref(true)
const menuAbierto = ref(false)
const destello = ref<{ texto: string; icono?: string; lado: string; clave: number } | null>(null)
const { completa, hayPip, pantalla, pip } = usePantallaCompleta(caja, video)

/* El volumen elegido se recuerda entre clases, como en cualquier reproductor. */
try {
  const guardado = localStorage.getItem('sk-volumen')
  if (guardado !== null) volumen.value = Math.min(1, Math.max(0, Number(guardado)))
} catch {
  // Sin almacenamiento se arranca al máximo.
}

onMounted(async () => {
  if (!props.src || !video.value) return
  video.value.volume = volumen.value
  await cargar(props.src, props.desde)
})

// Al elegir una clase de la lista, arranca sola; la bienvenida espera al clic.
watch(listo, (ok) => {
  if (ok && props.autoplay) video.value?.play().catch(() => {})
})

watch(
  usarMarco,
  async (si) => {
    if (!si) return
    await nextTick()
    emit('marco', iframe.value)
  },
  { immediate: true },
)

/* ── Lo que avisa el <video> ── */
function alTiempo() {
  const el = video.value!
  tiempo.value = el.currentTime
  emit('progreso', el.currentTime, el.duration || null)
}

function alCargar() {
  const el = video.value!
  for (let i = 0; i < el.buffered.length; i++) {
    if (el.buffered.start(i) <= el.currentTime + 0.5 && el.currentTime <= el.buffered.end(i)) {
      cargado.value = el.buffered.end(i)
    }
  }
}

function alPlay() {
  reproduciendo.value = true
  empezo.value = true
  despertar()
}

function alPausa() {
  reproduciendo.value = false
  activo.value = true
}

function alVolumen() {
  const el = video.value!
  volumen.value = el.volume
  silencio.value = el.muted
  try {
    localStorage.setItem('sk-volumen', String(el.volume))
  } catch {
    // No recordarlo no rompe nada.
  }
}

function alFin() {
  reproduciendo.value = false
  activo.value = true
  emit('terminado')
}

/* ── Lo que pide la alumna ── */
function alternar() {
  const el = video.value
  if (!el) return
  if (el.paused || el.ended) el.play().catch(() => {})
  else el.pause()
}

function buscar(segundos: number) {
  const el = video.value
  if (!el || !duracion.value) return
  el.currentTime = Math.min(Math.max(0, segundos), duracion.value - 0.1)
  tiempo.value = el.currentTime
}

function saltar(delta: number) {
  buscar(tiempo.value + delta)
  mostrar(`${delta > 0 ? '+' : '−'}${Math.abs(delta)} s`, delta > 0 ? 'der' : 'izq')
}

function cambiarVolumen(valor: number) {
  const el = video.value
  if (!el) return
  el.volume = valor
  el.muted = valor === 0
}

function silenciar() {
  const el = video.value
  if (!el) return
  el.muted = !el.muted
  if (!el.muted && el.volume === 0) el.volume = 0.5
}

function cambiarVelocidad(valor: number) {
  if (video.value) video.value.playbackRate = valor
  velocidad.value = valor
}

/* ── Los controles se esconden solos mientras corre el video ── */
let reloj: ReturnType<typeof setTimeout> | null = null

function despertar() {
  activo.value = true
  if (reloj) clearTimeout(reloj)
  reloj = setTimeout(() => {
    if (reproduciendo.value && !menuAbierto.value) activo.value = false
  }, 2600)
}

function mostrar(texto: string, lado: string, icono?: string) {
  destello.value = { texto, lado, icono, clave: Date.now() }
}

/*
 * Tocar el video. Con mouse: un clic pausa, doble clic pantalla completa.
 * Con el dedo: un toque muestra u oculta los controles, y doble toque en un
 * costado salta 10 segundos — lo que hace la mano sola después de YouTube.
 */
let ultimoToque = 0
let toquePendiente: ReturnType<typeof setTimeout> | null = null

function alTocar(e: PointerEvent) {
  if (!empezo.value) return alternar()

  const ancho = (e.currentTarget as HTMLElement).clientWidth
  const lado = e.offsetX < ancho * 0.35 ? -1 : e.offsetX > ancho * 0.65 ? 1 : 0
  const ahora = Date.now()
  const doble = ahora - ultimoToque < 300
  ultimoToque = doble ? 0 : ahora

  if (e.pointerType !== 'mouse') {
    if (toquePendiente) clearTimeout(toquePendiente)
    toquePendiente = null
    if (doble && lado) {
      saltar(lado * 10)
      return
    }
    toquePendiente = setTimeout(() => {
      if (activo.value && reproduciendo.value) activo.value = false
      else despertar()
    }, 300)
    return
  }

  alternar()
  if (doble) pantalla()
  else mostrar('', 'centro', reproduciendo.value ? ICONOS.pausa : ICONOS.play)
}

function alTeclado(e: KeyboardEvent) {
  if (usarMarco.value || e.metaKey || e.ctrlKey || e.altKey) return
  const objetivo = e.target as HTMLElement
  if (objetivo.tagName === 'INPUT') return
  if (e.key === ' ' && objetivo.tagName === 'BUTTON') return

  switch (e.key.toLowerCase()) {
    case ' ':
    case 'k':
      alternar()
      break
    case 'j':
      saltar(-10)
      break
    case 'l':
      saltar(10)
      break
    case 'arrowleft':
      saltar(-5)
      break
    case 'arrowright':
      saltar(5)
      break
    case 'arrowup':
      cambiarVolumen(Math.min(1, volumen.value + 0.1))
      break
    case 'arrowdown':
      cambiarVolumen(Math.max(0, volumen.value - 0.1))
      break
    case 'f':
      pantalla()
      break
    case 'm':
      silenciar()
      break
    default:
      return
  }
  e.preventDefault()
  despertar()
}

onBeforeUnmount(() => {
  if (reloj) clearTimeout(reloj)
  if (toquePendiente) clearTimeout(toquePendiente)
})
</script>

<template>
  <div
    ref="caja"
    class="player"
    :class="{
      'player--oculto': empezo && reproduciendo && !activo,
      'player--completa': completa,
    }"
    tabindex="0"
    :aria-label="`Reproductor: ${titulo}`"
    @keydown="alTeclado"
    @pointermove="$event.pointerType === 'mouse' && despertar()"
    @mouseleave="reproduciendo && !menuAbierto && (activo = false)"
  >
    <iframe
      v-if="usarMarco"
      ref="iframe"
      class="player__marco"
      :src="embedUrl"
      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
      allowfullscreen
      :title="titulo"
    />

    <template v-else>
      <video
        ref="video"
        class="player__video"
        :poster="poster ?? undefined"
        playsinline
        preload="metadata"
        @timeupdate="alTiempo"
        @progress="alCargar"
        @durationchange="duracion = video!.duration || 0"
        @loadedmetadata="duracion = video!.duration || 0"
        @play="alPlay"
        @pause="alPausa"
        @waiting="esperando = true"
        @playing="esperando = false"
        @canplay="esperando = false"
        @volumechange="alVolumen"
        @ended="alFin"
      />

      <div class="player__capa" @pointerup="alTocar" />

      <p v-if="completa" class="player__titulo">{{ titulo }}</p>

      <button
        v-if="!reproduciendo && !esperando"
        type="button"
        class="player__grande"
        :class="{ 'player__grande--pausa': empezo }"
        aria-label="Reproducir"
        @click="alternar"
      >
        <svg viewBox="0 0 24 24"><path :d="ICONOS.play" /></svg>
      </button>

      <span v-if="esperando" class="player__cargando" aria-hidden="true" />

      <Transition name="destello">
        <span
          v-if="destello"
          :key="destello.clave"
          class="player__destello"
          :class="`player__destello--${destello.lado}`"
          @animationend="destello = null"
        >
          <svg v-if="destello.icono" viewBox="0 0 24 24"><path :d="destello.icono" /></svg>
          <template v-else>{{ destello.texto }}</template>
        </span>
      </Transition>

      <VideoControls
        v-show="empezo"
        class="player__controles"
        :reproduciendo="reproduciendo"
        :tiempo="tiempo"
        :duracion="duracion"
        :cargado="cargado"
        :volumen="volumen"
        :silencio="silencio"
        :velocidad="velocidad"
        :calidades="calidades"
        :calidad="calidad"
        :completa="completa"
        :hay-pip="hayPip"
        @alternar="alternar"
        @buscar="buscar"
        @saltar="saltar"
        @volumen="cambiarVolumen"
        @silenciar="silenciar"
        @velocidad="cambiarVelocidad"
        @calidad="elegirCalidad"
        @pantalla="pantalla"
        @pip="pip"
        @menu="(abierto) => ((menuAbierto = abierto), despertar())"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped src="./VideoPlayer.scss"></style>

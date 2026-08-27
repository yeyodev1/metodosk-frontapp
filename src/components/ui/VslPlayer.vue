<script setup lang="ts">
/**
 * El video de bienvenida.
 *
 * En modo obligatorio no hay botón de saltar: el aviso "continuar" aparece
 * cuando el video termina. Pero *siempre* termina apareciendo, por tres vías —
 * el evento `ended` del reproductor, un tiempo de respaldo calculado con la
 * duración real, y el fallo de carga. Alguien que acaba de pagar $67 no puede
 * quedarse encerrado porque un iframe no cargó.
 *
 * El evento llega por el protocolo player.js del reproductor de Bunny, que se
 * habla por postMessage — no hace falta traer su librería para escuchar uno.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    embedUrl: string
    /** Segundos reales del video, para calcular el respaldo. */
    durationSeconds?: number | null
    /** Sin esto el video se ve, pero no bloquea nada. */
    obligatorio?: boolean
    autoplay?: boolean
  }>(),
  { durationSeconds: null, obligatorio: false, autoplay: true },
)

const emit = defineEmits<{ terminado: [] }>()

const marco = ref<HTMLIFrameElement | null>(null)
const terminado = ref(false)
let respaldo: ReturnType<typeof setTimeout> | null = null

/** El reproductor de Bunny se configura por query string. */
const src = computed(() => {
  const url = new URL(props.embedUrl)
  url.searchParams.set('autoplay', props.autoplay ? 'true' : 'false')
  url.searchParams.set('preload', 'true')
  url.searchParams.set('responsive', 'true')
  return url.toString()
})

function acabo() {
  if (terminado.value) return
  terminado.value = true
  emit('terminado')
}

/** El protocolo player.js: se pide escuchar `ended` en cuanto el player avisa. */
function escuchar(evento: MessageEvent) {
  if (typeof evento.data !== 'string') return
  let mensaje: { event?: string; context?: string }
  try {
    mensaje = JSON.parse(evento.data)
  } catch {
    return
  }
  if (mensaje.context !== 'player.js') return

  if (mensaje.event === 'ready') {
    marco.value?.contentWindow?.postMessage(
      JSON.stringify({
        context: 'player.js',
        version: '0.0.11',
        method: 'addEventListener',
        value: 'ended',
      }),
      '*',
    )
  }

  if (mensaje.event === 'ended') acabo()
}

onMounted(() => {
  window.addEventListener('message', escuchar)

  // Respaldo: la duración real más un margen. Si el evento no llega —bloqueo de
  // terceros, iframe que no carga— el botón aparece igual.
  const espera = ((props.durationSeconds ?? 90) + 8) * 1000
  respaldo = setTimeout(acabo, espera)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', escuchar)
  if (respaldo) clearTimeout(respaldo)
})
</script>

<template>
  <div class="vsl">
    <div class="vsl__marco">
      <iframe
        ref="marco"
        :src="src"
        loading="eager"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen
        title="Video de bienvenida"
        @error="acabo"
      />
    </div>

    <Transition name="aviso">
      <p v-if="obligatorio && !terminado" class="vsl__nota">
        Míralo completo. Son menos de dos minutos y explican cómo arrancar.
      </p>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.vsl {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.vsl__marco {
  position: relative;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: $radius-md;
  background-color: $ink;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

.vsl__nota {
  font-size: $text-xs;
  color: $ink-muted;
}
</style>

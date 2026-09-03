<script setup lang="ts">
/**
 * El muro de la comunidad.
 *
 * Se lee como un chat —abajo lo más nuevo, con la hora al lado de cada
 * mensaje— porque es lo que hay que reconocer sin explicaciones. No es un foro
 * con hilos: las dudas de un ejercicio ya tienen su sitio bajo cada video, y
 * duplicarlo acá dejaría las dos conversaciones a medias.
 *
 * Se refresca solo cada pocos segundos pidiendo únicamente lo que llegó
 * después del último mensaje que ya tenemos. Un muro que solo se actualiza al
 * recargar la página no se siente vivo, y bajar los sesenta mensajes completos
 * cada quince segundos sería gastar batería para repintar lo mismo.
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import communityService, {
  MAX_LARGO_MENSAJE,
  type MensajeComunidad,
} from '@/services/communityService'
import CommunityMessage from './CommunityMessage.vue'

const props = defineProps<{ puedeEscribir?: boolean }>()

const mensajes = ref<MensajeComunidad[]>([])
const texto = ref('')
const cargando = ref(true)
const enviando = ref(false)
const error = ref('')
const lista = ref<HTMLElement | null>(null)

const REFRESCO_MS = 15_000
let temporizador: ReturnType<typeof setInterval> | null = null

const restantes = computed(() => MAX_LARGO_MENSAJE - texto.value.length)
const puede = computed(() => props.puedeEscribir !== false)

/** Solo si ya estaba abajo: arrastrar la vista mientras lee sería peor. */
function bajar(forzar = false) {
  const el = lista.value
  if (!el) return
  const cerca = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  if (!forzar && !cerca) return
  nextTick(() => {
    el.scrollTop = el.scrollHeight
  })
}

async function cargar() {
  try {
    const { mensajes: nuevos } = await communityService.listar()
    mensajes.value = nuevos
    bajar(true)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar la comunidad'
  } finally {
    cargando.value = false
  }
}

/** Solo lo que llegó después del último que ya tenemos. */
async function refrescar() {
  const ultimo = mensajes.value[mensajes.value.length - 1]
  if (!ultimo) return cargar()

  try {
    const { mensajes: nuevos } = await communityService.listar(ultimo.createdAt)
    if (!nuevos.length) return
    // Puede repetirse el que acabamos de publicar nosotras.
    const vistos = new Set(mensajes.value.map((m) => m.id))
    mensajes.value.push(...nuevos.filter((m) => !vistos.has(m.id)))
    bajar()
  } catch {
    // Un refresco que falla no dice nada: el siguiente lo intenta otra vez.
  }
}

async function enviar() {
  const cuerpo = texto.value.trim()
  if (!cuerpo || enviando.value) return

  enviando.value = true
  error.value = ''
  try {
    mensajes.value.push(await communityService.publicar(cuerpo))
    texto.value = ''
    bajar(true)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos publicarlo'
  } finally {
    enviando.value = false
  }
}

async function borrar(id: string) {
  try {
    await communityService.borrar(id)
    mensajes.value = mensajes.value.filter((m) => m.id !== id)
  } catch {
    error.value = 'No pudimos borrarlo'
  }
}

/** Enter envía; Shift+Enter hace salto de línea, como en cualquier chat. */
function teclas(evento: KeyboardEvent) {
  if (evento.key === 'Enter' && !evento.shiftKey) {
    evento.preventDefault()
    enviar()
  }
}

onMounted(async () => {
  await cargar()
  temporizador = setInterval(refrescar, REFRESCO_MS)
})

onUnmounted(() => {
  if (temporizador) clearInterval(temporizador)
})
</script>

<template>
  <section class="chat">
    <div ref="lista" class="chat__lista">
      <p v-if="cargando" class="chat__estado">
        <FaIcon icon="spinner" spin /> Cargando la comunidad…
      </p>

      <div v-else-if="!mensajes.length" class="chat__vacio">
        <span class="chat__vacio-icono"><FaIcon icon="comments" /></span>
        <p class="chat__vacio-title">Todavía no hay mensajes</p>
        <p class="chat__vacio-texto">
          Sé la primera. Preséntate: tu nombre, de dónde eres y qué te trajo al reto.
        </p>
      </div>

      <CommunityMessage
        v-for="m in mensajes"
        :key="m.id"
        :mensaje="m"
        @borrar="borrar"
      />
    </div>

    <form v-if="puede" class="compositor" @submit.prevent="enviar">
      <textarea
        v-model="texto"
        class="compositor__campo"
        rows="1"
        :maxlength="MAX_LARGO_MENSAJE"
        placeholder="Escribe algo para la comunidad…"
        @keydown="teclas"
      />
      <button
        type="submit"
        class="compositor__enviar"
        :disabled="!texto.trim() || enviando"
        aria-label="Enviar"
      >
        <FaIcon :icon="enviando ? 'spinner' : 'paper-plane'" :spin="enviando" />
      </button>
    </form>

    <p v-if="texto.length > MAX_LARGO_MENSAJE - 120" class="chat__contador">
      Te quedan {{ restantes }} caracteres
    </p>
    <p v-if="error" class="chat__error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>
  </section>
</template>

<style lang="scss" scoped>
.chat {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.chat__lista {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: clamp(320px, 52vh, 560px);
  padding: clamp(0.9rem, 3vw, 1.3rem);
  border-radius: $radius-lg;
  background-color: $cream;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.chat__estado,
.chat__vacio {
  margin: auto;
  text-align: center;
  font-size: $text-sm;
  color: $ink-soft;
}

.chat__vacio-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 0.7rem;
  border-radius: 50%;
  background-color: $rose-soft;
  color: $wine;
}

.chat__vacio-title {
  font-family: $font-display;
  font-size: $text-base;
  color: $ink;
}

.chat__vacio-texto {
  max-width: 36ch;
  margin: 0.2rem auto 0;
  line-height: 1.55;
}

/* ── Compositor ── */
.compositor {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.45rem 0.45rem 0.45rem 0.9rem;
  border-radius: $radius-lg;
  background-color: $cream;

  &:focus-within {
    box-shadow: inset 0 0 0 1.5px $rose;
  }
}

.compositor__campo {
  flex: 1 1 auto;
  min-width: 0;
  max-height: 8rem;
  padding: 0.5rem 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: $text-sm;
  line-height: 1.5;
  color: $ink;
  resize: none;

  &:focus {
    outline: none;
  }
}

.compositor__enviar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: $ink;
  font-size: 0.85rem;
  color: $cream;
  cursor: pointer;
  transition: background-color 0.26s $ease, opacity 0.26s $ease;

  &:hover:not(:disabled) {
    background-color: $wine;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @include focus-ring;
}

.chat__contador,
.chat__error {
  font-size: $text-xs;
  color: $ink-muted;
}

.chat__error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: $alert-error;
}
</style>

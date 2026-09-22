<script setup lang="ts">
/**
 * Lo que Karen y Scarlett le dijeron sobre su avance.
 *
 * Es a donde lleva el correo de "Karen comentó tu avance": el enlace trae
 * `?nota=<id>#notas`, y al cargar se baja hasta esa nota y se marca. Si no hay
 * ninguna todavía, la sección no se pinta — un "no hay comentarios" en su
 * progreso se leería como que nadie la está mirando.
 *
 * Las notas se marcan como leídas al mostrarse, pero la etiqueta "Nuevo" se
 * queda durante esta visita: es justo cuando sirve.
 */
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import avancesService, { type Nota } from '@/services/avancesService'
import HiloNotas from './HiloNotas.vue'
import '@/plugins/icons'

const route = useRoute()
const notas = ref<Nota[]>([])
const cargado = ref(false)
const respuesta = ref('')
const enviando = ref(false)
const error = ref('')

const resaltada = computed(() =>
  typeof route.query.nota === 'string' ? route.query.nota : null,
)
const nuevas = computed(() => notas.value.filter((n) => n.fromStaff && !n.leidaEl).length)

const raiz = ref<HTMLElement | null>(null)

async function llevarALaNota() {
  await nextTick()
  const destino =
    (resaltada.value && document.getElementById(`nota-${resaltada.value}`)) ||
    (route.hash === '#notas' ? raiz.value : null)
  if (!destino) return
  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  destino.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' })
}

async function responder() {
  const texto = respuesta.value.trim()
  if (!texto || enviando.value) return
  enviando.value = true
  error.value = ''
  try {
    const data = await avancesService.responder(texto)
    // Las que ya vio en esta visita siguen marcadas como vistas.
    notas.value = data.notas.map((n) => ({
      ...n,
      leidaEl: n.leidaEl ?? notas.value.find((x) => x.id === n.id)?.leidaEl ?? null,
    }))
    respuesta.value = ''
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos enviar tu respuesta'
  } finally {
    enviando.value = false
  }
}

onMounted(async () => {
  try {
    const data = await avancesService.misNotas()
    notas.value = data.notas
    cargado.value = true
    if (data.nuevas) avancesService.marcarLeidas().catch(() => undefined)
    if (notas.value.length) await llevarALaNota()
  } catch {
    // Si esto falla, el resto de su progreso sigue en pie: no se muestra.
  }
})
</script>

<template>
  <section v-if="cargado && notas.length" id="notas" ref="raiz" class="notas">
    <header class="notas__head">
      <p class="notas__eyebrow"><FaIcon icon="lock" /> Solo lo ves tú</p>
      <h2 class="notas__title">
        Lo que te dice el equipo
        <span v-if="nuevas" class="notas__cuenta">{{ nuevas }} {{ nuevas === 1 ? 'nuevo' : 'nuevos' }}</span>
      </h2>
      <p class="notas__sub">
        Karen y Scarlett miran tus fotos y te dejan acá sus recomendaciones. Puedes contestarles.
      </p>
    </header>

    <HiloNotas :notas="notas" lado="alumna" :resaltada="resaltada" />

    <form class="responder" @submit.prevent="responder">
      <label class="sr-only" for="respuesta-nota">Tu respuesta</label>
      <textarea
        id="respuesta-nota"
        v-model="respuesta"
        rows="2"
        maxlength="3000"
        placeholder="Escribe tu respuesta o tu duda…"
        @keydown.meta.enter="responder"
        @keydown.ctrl.enter="responder"
      />
      <button type="submit" class="responder__btn" :disabled="!respuesta.trim() || enviando">
        <FaIcon :icon="enviando ? 'spinner' : 'paper-plane'" :spin="enviando" />
        Responder
      </button>
    </form>
    <p v-if="error" class="notas__error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>
  </section>
</template>

<style lang="scss" scoped>
.notas {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.2rem, 3vw, 1.8rem);
  border-radius: $radius-lg;
  background-color: $cream;
  scroll-margin-top: 4.5rem;
}

.notas__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  @include eyebrow;

  svg {
    font-size: 0.85em;
  }
}

.notas__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.3rem;
  font-family: $font-display;
  font-size: $text-xl;
  color: $ink;
}

.notas__cuenta {
  padding: 0.2rem 0.7rem;
  border-radius: $radius-pill;
  background-color: $wine;
  color: $cream;
  font-family: $font-principal;
  font-size: $text-xs;
  font-weight: 600;
}

.notas__sub {
  margin-top: 0.3rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
}

.responder {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.6rem;
  margin-top: 0.3rem;

  textarea {
    flex: 1 1 240px;
    min-height: 3rem;
    padding: 0.8rem 1rem;
    border: 1px solid rgba($ink, 0.15);
    border-radius: $radius-md;
    background-color: $bone;
    font-family: inherit;
    font-size: $text-sm;
    line-height: 1.5;
    color: $ink;
    resize: vertical;
    transition: border-color 0.24s $ease;

    &:focus {
      outline: none;
      border-color: $rose-deep;
    }
  }
}

.responder__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.3rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  color: $cream;
  font-family: inherit;
  font-size: $text-xs;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background-color 0.28s $ease, opacity 0.28s $ease;

  &:hover:not(:disabled) {
    background-color: $wine;
  }

  &:disabled {
    opacity: 0.45;
    cursor: default;
  }

  @include focus-ring;
}

.notas__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: $text-sm;
  color: $alert-error;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>

<script setup lang="ts">
/**
 * Los comentarios de un video.
 *
 * Van colgados del video y no de un muro general: una duda sobre la sentadilla
 * sirve de poco tres pantallas más allá de donde se vio el ejercicio.
 *
 * El comentario aparece en pantalla antes de que el servidor confirme. Quien
 * escribe una duda quiere verla puesta, no un spinner; si falla, se avisa y el
 * texto se devuelve al campo en vez de perderse.
 */
import { computed, onMounted, ref, watch } from 'vue'
import commentService, { type Comentario } from '@/services/commentService'
import { useSessionStore } from '@/stores/session'

const props = defineProps<{
  courseId: string
  lessonId: string
  /** Encabezado, para que la sección diga de qué va. */
  titulo?: string
}>()

const session = useSessionStore()

const comentarios = ref<Comentario[]>([])
const cargando = ref(true)
const error = ref('')
const texto = ref('')
const enviando = ref(false)
const respondiendoA = ref<string | null>(null)
const respuesta = ref('')

const total = computed(() =>
  comentarios.value.reduce((n, c) => n + 1 + c.respuestas.length, 0),
)

function cuando(iso: string) {
  const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutos < 1) return 'ahora'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.round(minutos / 60)
  if (horas < 24) return `hace ${horas} h`
  const dias = Math.round(horas / 24)
  if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`
  return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
}

function inicial(nombre: string) {
  return (nombre || '?')[0]!.toUpperCase()
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    comentarios.value = await commentService.listar(props.courseId, props.lessonId)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar los comentarios'
  } finally {
    cargando.value = false
  }
}

async function publicar() {
  const cuerpo = texto.value.trim()
  if (!cuerpo || enviando.value) return

  enviando.value = true
  texto.value = ''
  try {
    const creado = await commentService.crear(props.courseId, props.lessonId, cuerpo)
    comentarios.value.unshift(creado)
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos publicar tu comentario'
    texto.value = cuerpo
  } finally {
    enviando.value = false
  }
}

async function responder(padre: Comentario) {
  const cuerpo = respuesta.value.trim()
  if (!cuerpo || enviando.value) return

  enviando.value = true
  respuesta.value = ''
  try {
    const creada = await commentService.crear(props.courseId, props.lessonId, cuerpo, padre.id)
    padre.respuestas.push(creada)
    respondiendoA.value = null
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos publicar tu respuesta'
    respuesta.value = cuerpo
  } finally {
    enviando.value = false
  }
}

async function borrar(id: string) {
  try {
    await commentService.borrar(id)
    comentarios.value = comentarios.value.filter((c) => c.id !== id)
    for (const c of comentarios.value) {
      c.respuestas = c.respuestas.filter((r) => r.id !== id)
    }
  } catch {
    error.value = 'No pudimos borrar el comentario'
  }
}

watch(() => [props.courseId, props.lessonId], cargar)
onMounted(cargar)
</script>

<template>
  <section class="hilo">
    <header class="hilo__head">
      <h3 class="hilo__title">
        <FaIcon icon="comments" />
        {{ titulo || 'Preguntas y comentarios' }}
      </h3>
      <span v-if="total" class="hilo__conteo">{{ total }}</span>
    </header>

    <p class="hilo__nota">
      Escribe tu duda acá y te responde el equipo. Lo que preguntes lo leen también las demás — casi
      siempre alguien tenía la misma pregunta.
    </p>

    <form class="escribir" @submit.prevent="publicar">
      <span class="avatar avatar--yo">{{ inicial(session.user?.name || 'A') }}</span>
      <div class="escribir__campo">
        <textarea
          v-model="texto"
          rows="2"
          placeholder="¿Qué te quedó dando vueltas de esta clase?"
          maxlength="2000"
        />
        <button type="submit" class="escribir__enviar" :disabled="!texto.trim() || enviando">
          <FaIcon :icon="enviando ? 'spinner' : 'paper-plane'" :spin="enviando" />
          {{ enviando ? 'Enviando' : 'Publicar' }}
        </button>
      </div>
    </form>

    <Transition name="aviso">
      <p v-if="error" class="hilo__error">
        <FaIcon icon="triangle-exclamation" /> {{ error }}
      </p>
    </Transition>

    <p v-if="cargando" class="hilo__vacio">Cargando comentarios…</p>

    <p v-else-if="!comentarios.length" class="hilo__vacio">
      Todavía nadie ha preguntado nada por acá. Estrena el hilo.
    </p>

    <ul v-else class="lista">
      <li v-for="c in comentarios" :key="c.id" class="comentario">
        <span class="avatar" :class="{ 'avatar--staff': c.fromStaff }">
          {{ inicial(c.authorName) }}
        </span>

        <div class="comentario__cuerpo">
          <p class="comentario__meta">
            <strong>{{ c.authorName }}</strong>
            <span v-if="c.fromStaff" class="chip">Equipo</span>
            <span class="comentario__fecha">{{ cuando(c.createdAt) }}</span>
          </p>
          <p class="comentario__texto">{{ c.body }}</p>

          <div class="comentario__acciones">
            <button
              type="button"
              class="mini"
              @click="respondiendoA = respondiendoA === c.id ? null : c.id"
            >
              <FaIcon icon="reply" /> Responder
            </button>
            <button v-if="c.mine" type="button" class="mini mini--danger" @click="borrar(c.id)">
              <FaIcon icon="trash" /> Borrar
            </button>
          </div>

          <Transition name="aviso">
            <form v-if="respondiendoA === c.id" class="responder" @submit.prevent="responder(c)">
              <textarea v-model="respuesta" rows="2" placeholder="Tu respuesta…" maxlength="2000" />
              <button type="submit" class="mini mini--fuerte" :disabled="!respuesta.trim()">
                Responder
              </button>
            </form>
          </Transition>

          <ul v-if="c.respuestas.length" class="respuestas">
            <li v-for="r in c.respuestas" :key="r.id" class="comentario comentario--hija">
              <span class="avatar avatar--sm" :class="{ 'avatar--staff': r.fromStaff }">
                {{ inicial(r.authorName) }}
              </span>
              <div class="comentario__cuerpo">
                <p class="comentario__meta">
                  <strong>{{ r.authorName }}</strong>
                  <span v-if="r.fromStaff" class="chip">Equipo</span>
                  <span class="comentario__fecha">{{ cuando(r.createdAt) }}</span>
                </p>
                <p class="comentario__texto">{{ r.body }}</p>
                <button v-if="r.mine" type="button" class="mini mini--danger" @click="borrar(r.id)">
                  <FaIcon icon="trash" /> Borrar
                </button>
              </div>
            </li>
          </ul>
        </div>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.hilo {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.hilo__head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.hilo__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;

  svg {
    font-size: 0.85em;
    color: $rose-deep;
  }
}

.hilo__conteo {
  padding: 0.1rem 0.55rem;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.07);
  font-size: $text-xs;
  color: $ink-muted;
}

.hilo__nota {
  max-width: 62ch;
  font-size: $text-sm;
  color: $ink-soft;
}

/* ── Escribir ── */
.escribir {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.3rem;
}

.escribir__campo {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  min-width: 0;
}

textarea {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid rgba($ink, 0.14);
  border-radius: $radius-md;
  background-color: $cream;
  font-family: inherit;
  font-size: $text-sm;
  line-height: 1.5;
  color: $ink;
  resize: vertical;
  transition: border-color 0.28s $ease;

  &::placeholder {
    color: rgba($ink, 0.35);
  }

  &:focus {
    border-color: rgba($ink, 0.4);
    outline: none;
  }
}

.escribir__enviar {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.2rem;
  border: none;
  border-radius: $radius-pill;
  background-color: $ink;
  font-family: inherit;
  font-size: $text-xs;
  letter-spacing: 0.05em;
  color: $cream;
  cursor: pointer;
  transition: background-color 0.28s $ease, opacity 0.28s $ease;

  &:hover:not(:disabled) {
    background-color: $wine;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @include focus-ring;
}

/* ── Avatares ── */
.avatar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: $sand;
  font-family: $font-display;
  font-size: 0.95rem;
  color: $ink;
}

.avatar--sm {
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
}

.avatar--yo {
  background-color: $rose-soft;
  color: $wine;
}

.avatar--staff {
  background-color: $ink;
  color: $cream;
}

/* ── Lista ── */
.lista,
.respuestas {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  list-style: none;
}

.respuestas {
  margin-top: 0.7rem;
  padding-left: 0.9rem;
  border-left: 2px solid rgba($ink, 0.08);
}

.comentario {
  display: flex;
  gap: 0.7rem;
}

.comentario__cuerpo {
  flex: 1 1 auto;
  min-width: 0;
}

.comentario__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: $text-sm;
  color: $ink;
}

.chip {
  padding: 0.08rem 0.5rem;
  border-radius: $radius-pill;
  background-color: $rose-soft;
  font-size: 0.66rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: $wine;
}

.comentario__fecha {
  font-size: $text-xs;
  color: $ink-muted;
}

.comentario__texto {
  margin-top: 0.2rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.comentario__acciones {
  display: flex;
  gap: 0.9rem;
  margin-top: 0.35rem;
}

.mini {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-muted;
  cursor: pointer;
  transition: color 0.24s $ease;

  &:hover:not(:disabled) {
    color: $ink;
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.mini--danger:hover {
  color: $alert-error;
}

.mini--fuerte {
  align-self: flex-start;
  padding: 0.4rem 0.9rem;
  border-radius: $radius-pill;
  background-color: $ink;
  color: $cream;

  &:hover:not(:disabled) {
    color: $cream;
    background-color: $wine;
  }
}

.responder {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.hilo__vacio {
  padding: 1.2rem;
  border: 1px dashed rgba($ink, 0.16);
  border-radius: $radius-md;
  font-size: $text-sm;
  color: $ink-muted;
  text-align: center;
}

.hilo__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: $radius-sm;
  background-color: $alert-error-bg;
  font-size: $text-sm;
  color: $alert-error;
}
</style>

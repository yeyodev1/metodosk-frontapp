<script setup lang="ts">
/**
 * Moderación de comentarios.
 *
 * Lo primero que se ve son los que nadie ha respondido: una alumna que pregunta
 * y no recibe respuesta es la que deja de preguntar, y después deja el reto.
 *
 * Ocultar no borra. Un hilo que desaparece sin rastro deja a quien preguntó sin
 * saber qué pasó; ocultar quita el comentario de la vista de las demás y se
 * puede deshacer. Borrar existe, pero es para spam.
 */
import { computed, onMounted, ref } from 'vue'
import commentService, { type ComentarioAdmin } from '@/services/commentService'
import courseService, { type CursoAdmin } from '@/services/courseService'

const comentarios = ref<ComentarioAdmin[]>([])
const cursos = ref<CursoAdmin[]>([])
const cargando = ref(true)
const error = ref('')
const soloPendientes = ref(false)

const pendientes = computed(() =>
  comentarios.value.filter((c) => !c.respuestas && !c.fromStaff).length,
)

const visibles = computed(() =>
  soloPendientes.value
    ? comentarios.value.filter((c) => !c.respuestas && !c.fromStaff)
    : comentarios.value,
)

/** De dónde vino el comentario, en palabras y no en identificadores. */
function donde(c: ComentarioAdmin) {
  if (c.courseId === 'vsl') return 'Video de bienvenida'
  const curso = cursos.value.find((x) => x.id === c.courseId)
  if (!curso) return 'Curso eliminado'
  if (c.lessonId === 'welcome') return `${curso.title} · bienvenida`
  const clase = curso.lessons.find((l) => l.id === c.lessonId)
  return clase ? `${curso.title} · ${clase.title}` : curso.title
}

function cuando(iso: string) {
  return new Date(iso).toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function inicial(nombre: string) {
  return (nombre || '?')[0]!.toUpperCase()
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [lista, data] = await Promise.all([
      commentService.listarAdmin(),
      courseService.listar(),
    ])
    comentarios.value = lista
    cursos.value = data.cursos
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar los comentarios'
  } finally {
    cargando.value = false
  }
}

async function alternarOculto(c: ComentarioAdmin) {
  const antes = c.hidden
  c.hidden = !antes
  try {
    await commentService.ocultar(c.id, !antes)
  } catch {
    c.hidden = antes
    error.value = 'No pudimos cambiar la visibilidad'
  }
}

async function eliminar(c: ComentarioAdmin) {
  if (!confirm(`¿Eliminar el comentario de ${c.authorName}? También se borran sus respuestas.`)) {
    return
  }
  try {
    await commentService.eliminar(c.id)
    comentarios.value = comentarios.value.filter((x) => x.id !== c.id)
  } catch {
    error.value = 'No pudimos eliminarlo'
  }
}

onMounted(cargar)
</script>

<template>
  <div class="moderacion">
    <header class="moderacion__head">
      <div>
        <p class="moderacion__eyebrow">Administración</p>
        <h1 class="moderacion__title">Comentarios</h1>
        <p class="moderacion__sub">
          Lo que preguntan tus alumnas, con el video del que salió cada duda.
        </p>
      </div>

      <button
        type="button"
        class="filtro"
        :class="{ 'filtro--on': soloPendientes }"
        @click="soloPendientes = !soloPendientes"
      >
        <FaIcon icon="circle-question" />
        {{ soloPendientes ? 'Viendo sin responder' : `Sin responder (${pendientes})` }}
      </button>
    </header>

    <p v-if="error" class="aviso aviso--error"><FaIcon icon="triangle-exclamation" /> {{ error }}</p>
    <p v-if="cargando" class="aviso"><FaIcon icon="spinner" spin /> Cargando…</p>

    <p v-else-if="!visibles.length" class="aviso">
      <FaIcon icon="comments" />
      {{ soloPendientes ? 'No hay preguntas sin responder. Al día.' : 'Todavía no hay comentarios.' }}
    </p>

    <ul v-else class="lista">
      <li v-for="c in visibles" :key="c.id" class="fila" :class="{ 'fila--oculta': c.hidden }">
        <span class="avatar" :class="{ 'avatar--staff': c.fromStaff }">
          {{ inicial(c.authorName) }}
        </span>

        <div class="fila__cuerpo">
          <p class="fila__meta">
            <strong>{{ c.authorName }}</strong>
            <span class="fila__donde"><FaIcon icon="film" /> {{ donde(c) }}</span>
            <span class="fila__fecha">{{ cuando(c.createdAt) }}</span>
          </p>

          <p class="fila__texto">{{ c.body }}</p>

          <p class="fila__estado">
            <span v-if="c.respuestas" class="chip chip--ok">
              <FaIcon icon="check" /> {{ c.respuestas }}
              {{ c.respuestas === 1 ? 'respuesta' : 'respuestas' }}
            </span>
            <span v-else-if="!c.fromStaff" class="chip chip--pendiente">Sin responder</span>
            <span v-if="c.hidden" class="chip chip--oculta"><FaIcon icon="eye-slash" /> Oculto</span>
          </p>
        </div>

        <div class="fila__acciones">
          <button type="button" class="mini" @click="alternarOculto(c)">
            <FaIcon :icon="c.hidden ? 'eye' : 'eye-slash'" />
            {{ c.hidden ? 'Mostrar' : 'Ocultar' }}
          </button>
          <button type="button" class="mini mini--danger" @click="eliminar(c)">
            <FaIcon icon="trash" /> Eliminar
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.moderacion {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.moderacion__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-sm;
}

.moderacion__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.moderacion__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.moderacion__sub {
  margin-top: 0.25rem;
  font-size: $text-sm;
  color: $ink-soft;
}

.filtro {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba($ink, 0.2);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.28s $ease, border-color 0.28s $ease, color 0.28s $ease;

  &:hover {
    border-color: $ink;
  }

  @include focus-ring;
}

.filtro--on {
  border-color: $ink;
  background-color: $ink;
  color: $cream;
}

.aviso {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;
}

.aviso--error {
  background-color: $alert-error-bg;
  color: $alert-error;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  list-style: none;
}

.fila {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  padding: clamp(1rem, 3vw, 1.3rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.fila--oculta {
  opacity: 0.55;
}

.avatar {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: $sand;
  font-family: $font-display;
  font-size: 1rem;
  color: $ink;
}

.avatar--staff {
  background-color: $ink;
  color: $cream;
}

.fila__cuerpo {
  flex: 1 1 260px;
  min-width: 0;
}

.fila__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
  font-size: $text-sm;
  color: $ink;
}

.fila__donde {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: $text-xs;
  color: $rose-deep;
}

.fila__fecha {
  font-size: $text-xs;
  color: $ink-muted;
}

.fila__texto {
  margin-top: 0.3rem;
  font-size: $text-sm;
  line-height: 1.55;
  color: $ink-soft;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.fila__estado {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.12rem 0.6rem;
  border-radius: $radius-pill;
  font-size: 0.68rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.chip--ok {
  background-color: $alert-success-bg;
  color: #4a7a45;
}

.chip--pendiente {
  background-color: $alert-warning-bg;
  color: #8a6410;
}

.chip--oculta {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}

.fila__acciones {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}

.mini {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-muted;
  cursor: pointer;
  transition: color 0.24s $ease;

  &:hover {
    color: $ink;
  }
}

.mini--danger:hover {
  color: $alert-error;
}
</style>

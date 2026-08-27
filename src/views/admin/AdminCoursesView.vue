<script setup lang="ts">
/**
 * Los cursos del método: crearlos, ordenar la ruta y subir el video.
 *
 * El orden es explícito y se mueve con flechas, no se deduce de la fecha en
 * que se subió cada cosa: la ruta la decide quien arma el método.
 *
 * Nada se publica solo. Un curso nace en borrador y hay que decir que está
 * listo — subir un video no debería exponerlo a las alumnas antes de revisarlo.
 */
import { computed, onMounted, ref } from 'vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import courseService, { type CursoAdmin, type Audiencia, type EstadoCurso } from '@/services/courseService'
import { useBunnyUpload } from '@/composables/useBunnyUpload'

const cursos = ref<CursoAdmin[]>([])
const bunnyListo = ref(true)
const cargando = ref(true)
const error = ref('')
const guardando = ref(false)

const editando = ref<string | null>(null)
const creando = ref(false)
const expandido = ref<string | null>(null)

const { subiendo, progreso, error: errorSubida, subir } = useBunnyUpload()
const subiendoEn = ref<string | null>(null)

const AUDIENCIAS: Array<{ value: Audiencia; label: string; hint: string }> = [
  { value: 'ambas', label: 'Los dos retos', hint: 'Recomposición y Volumen' },
  { value: 'recomposicion', label: 'Solo SK Recomposición', hint: 'Quema grasa y construye músculo' },
  { value: 'volumen', label: 'Solo SK Volumen', hint: 'Aumenta músculo con estrategia' },
]

const MESES = [
  { value: '1', label: 'Mes 1', hint: 'Base y técnica' },
  { value: '2', label: 'Mes 2', hint: 'Progresión' },
  { value: '3', label: 'Mes 3', hint: 'Consolidación' },
]

const ESTADOS: Array<{ value: EstadoCurso; label: string; hint: string }> = [
  { value: 'borrador', label: 'Borrador', hint: 'Solo lo ves tú' },
  { value: 'proximamente', label: 'Próximamente', hint: 'La alumna lo ve, aún no entra' },
  { value: 'publicado', label: 'Publicado', hint: 'Abierto para las alumnas' },
]

const ETIQUETA_AUDIENCIA: Record<Audiencia, string> = {
  ambas: 'Los dos retos',
  recomposicion: 'SK Recomposición',
  volumen: 'SK Volumen',
}

const vacio = () => ({
  title: '',
  summary: '',
  challenge: 'ambas' as Audiencia,
  unlockMonth: '1',
  status: 'borrador' as EstadoCurso,
})

const form = ref(vacio())
const nuevaClase = ref<Record<string, string>>({})

const ordenados = computed(() => [...cursos.value].sort((a, b) => a.order - b.order))

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const data = await courseService.listar()
    cursos.value = data.cursos
    bunnyListo.value = data.bunnyListo
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos cargar los cursos'
  } finally {
    cargando.value = false
  }
}

function abrirNuevo() {
  form.value = vacio()
  editando.value = null
  creando.value = true
}

function abrirEdicion(curso: CursoAdmin) {
  form.value = {
    title: curso.title,
    summary: curso.summary,
    challenge: curso.challenge,
    unlockMonth: String(curso.unlockMonth),
    status: curso.status,
  }
  creando.value = false
  editando.value = curso.id
}

function cerrarForm() {
  creando.value = false
  editando.value = null
}

async function guardar() {
  if (!form.value.title.trim()) return
  guardando.value = true
  try {
    const datos = {
      title: form.value.title,
      summary: form.value.summary,
      challenge: form.value.challenge,
      unlockMonth: Number(form.value.unlockMonth),
      status: form.value.status,
    }
    if (editando.value) await courseService.actualizar(editando.value, datos)
    else await courseService.crear(datos)
    cerrarForm()
    await cargar()
  } catch (e: unknown) {
    error.value = (e as { message?: string }).message ?? 'No pudimos guardar el curso'
  } finally {
    guardando.value = false
  }
}

/** Mover en la ruta: se manda la lista entera para que no queden huecos. */
async function mover(id: string, direccion: -1 | 1) {
  const lista = ordenados.value.map((c) => c.id)
  const i = lista.indexOf(id)
  const j = i + direccion
  if (i < 0 || j < 0 || j >= lista.length) return

  ;[lista[i], lista[j]] = [lista[j]!, lista[i]!]
  await courseService.reordenar(lista)
  await cargar()
}

async function eliminar(curso: CursoAdmin) {
  if (!confirm(`¿Eliminar "${curso.title}"? Se borran también sus videos de Bunny.`)) return
  await courseService.eliminar(curso.id)
  await cargar()
}

async function agregarClase(curso: CursoAdmin) {
  const titulo = (nuevaClase.value[curso.id] || '').trim()
  if (!titulo) return
  await courseService.agregarClase(curso.id, titulo)
  nuevaClase.value[curso.id] = ''
  await cargar()
}

async function quitarClase(courseId: string, lessonId: string) {
  await courseService.eliminarClase(courseId, lessonId)
  await cargar()
}

async function elegirVideo(evento: Event, courseId: string, destino: string) {
  const input = evento.target as HTMLInputElement
  const archivo = input.files?.[0]
  if (!archivo) return

  subiendoEn.value = `${courseId}:${destino}`
  const ok = await subir(courseId, destino, archivo)
  subiendoEn.value = null
  input.value = ''

  if (ok) {
    // Bunny codifica en background: se pregunta el estado tras un momento.
    setTimeout(() => courseService.estadoVideo(courseId, destino).then(cargar).catch(() => cargar()), 4000)
    await cargar()
  }
}

const ESTADO_VIDEO: Record<string, string> = {
  subiendo: 'Subiendo…',
  procesando: 'Bunny lo está procesando',
  listo: 'Listo para ver',
  error: 'Falló el procesado',
}

onMounted(cargar)
</script>

<template>
  <div class="cursos">
    <header class="cursos__head">
      <div>
        <p class="cursos__eyebrow">Administración</p>
        <h1 class="cursos__title">Cursos</h1>
        <p class="cursos__sub">La ruta del método: qué ve la alumna, en qué orden y desde cuándo.</p>
      </div>
      <button type="button" class="btn btn--solid" @click="abrirNuevo">Subir un curso</button>
    </header>

    <!-- Falta configuración: se dice qué falta, no "algo salió mal" -->
    <p v-if="!bunnyListo && !cargando" class="aviso aviso--warn">
      Bunny Stream no está configurado, así que todavía no se pueden subir videos. Faltan
      <code>BUNNY_STREAM_API_KEY</code>, <code>BUNNY_STREAM_LIBRARY_ID</code> y
      <code>BUNNY_STREAM_CDN_HOSTNAME</code> en el backend.
    </p>

    <p v-if="error" class="aviso aviso--error">{{ error }}</p>
    <p v-if="errorSubida" class="aviso aviso--error">{{ errorSubida }}</p>
    <p v-if="cargando" class="aviso">Cargando…</p>

    <!-- Alta y edición -->
    <Transition name="aviso">
      <form v-if="creando || editando" class="form" novalidate @submit.prevent="guardar">
        <h2 class="form__title">{{ editando ? 'Editar curso' : 'Nuevo curso' }}</h2>

        <label class="campo">
          <span class="campo__label">Título</span>
          <input v-model="form.title" type="text" placeholder="Tu entrenamiento" required />
        </label>

        <label class="campo">
          <span class="campo__label">De qué se trata</span>
          <textarea
            v-model="form.summary"
            rows="2"
            placeholder="La rutina completa de los 3 meses, en casa o en el gym."
          />
        </label>

        <div class="form__fila">
          <BaseSelect
            v-model="form.challenge"
            :options="AUDIENCIAS"
            label="Para quién es"
            block
          />
          <BaseSelect v-model="form.unlockMonth" :options="MESES" label="Se abre en" block />
          <BaseSelect v-model="form.status" :options="ESTADOS" label="Estado" block />
        </div>

        <div class="form__acciones">
          <button type="submit" class="btn btn--solid" :disabled="guardando">
            {{ guardando ? 'Guardando…' : 'Guardar' }}
          </button>
          <button type="button" class="btn" @click="cerrarForm">Cancelar</button>
        </div>
      </form>
    </Transition>

    <!-- La ruta -->
    <ol v-if="ordenados.length" class="ruta">
      <li v-for="(c, i) in ordenados" :key="c.id" class="curso">
        <div class="curso__orden">
          <button
            type="button"
            class="curso__mover"
            :disabled="i === 0"
            aria-label="Subir en la ruta"
            @click="mover(c.id, -1)"
          >↑</button>
          <span class="curso__num">{{ String(c.order).padStart(2, '0') }}</span>
          <button
            type="button"
            class="curso__mover"
            :disabled="i === ordenados.length - 1"
            aria-label="Bajar en la ruta"
            @click="mover(c.id, 1)"
          >↓</button>
        </div>

        <div class="curso__body">
          <div class="curso__linea">
            <h3 class="curso__title">{{ c.title }}</h3>
            <span :class="['pill', `pill--${c.status}`]">
              {{ ESTADOS.find((e) => e.value === c.status)?.label }}
            </span>
          </div>

          <p v-if="c.summary" class="curso__sum">{{ c.summary }}</p>

          <p class="curso__meta">
            {{ ETIQUETA_AUDIENCIA[c.challenge] }} · Se abre en el mes {{ c.unlockMonth }} ·
            {{ c.lessons.length }} {{ c.lessons.length === 1 ? 'clase' : 'clases' }}
          </p>

          <!-- Video de bienvenida -->
          <div class="video">
            <div class="video__info">
              <span class="video__label">Video de bienvenida</span>
              <span v-if="c.welcomeVideo" class="video__estado">
                {{ ESTADO_VIDEO[c.welcomeVideo.status] }}
              </span>
              <span v-else class="video__estado video__estado--falta">Sin subir</span>
            </div>

            <label class="btn btn--file" :class="{ 'btn--disabled': !bunnyListo }">
              {{ c.welcomeVideo ? 'Reemplazar' : 'Subir video' }}
              <input
                type="file"
                accept="video/*"
                :disabled="!bunnyListo || subiendo"
                @change="elegirVideo($event, c.id, 'welcome')"
              />
            </label>
          </div>

          <div v-if="subiendo && subiendoEn === `${c.id}:welcome`" class="barra">
            <span class="barra__relleno" :style="{ width: `${progreso}%` }" />
            <span class="barra__pct">{{ progreso }}%</span>
          </div>

          <button type="button" class="curso__toggle" @click="expandido = expandido === c.id ? null : c.id">
            {{ expandido === c.id ? 'Ocultar clases' : 'Ver clases' }}
          </button>

          <!-- Clases -->
          <Transition name="aviso">
            <div v-if="expandido === c.id" class="clases">
              <div v-for="l in c.lessons" :key="l.id" class="clase">
                <span class="clase__num">{{ String(l.order).padStart(2, '0') }}</span>
                <span class="clase__title">{{ l.title }}</span>
                <span class="clase__estado">
                  {{ l.video ? ESTADO_VIDEO[l.video.status] : 'Sin video' }}
                </span>
                <label class="btn btn--mini" :class="{ 'btn--disabled': !bunnyListo }">
                  {{ l.video ? 'Reemplazar' : 'Subir' }}
                  <input
                    type="file"
                    accept="video/*"
                    :disabled="!bunnyListo || subiendo"
                    @change="elegirVideo($event, c.id, l.id)"
                  />
                </label>
                <button type="button" class="clase__quitar" aria-label="Quitar clase" @click="quitarClase(c.id, l.id)">
                  ×
                </button>
              </div>

              <form class="clase-nueva" @submit.prevent="agregarClase(c)">
                <input
                  v-model="nuevaClase[c.id]"
                  type="text"
                  placeholder="Título de la clase"
                />
                <button type="submit" class="btn btn--mini">Agregar</button>
              </form>
            </div>
          </Transition>

          <div class="curso__acciones">
            <button type="button" class="link" @click="abrirEdicion(c)">Editar</button>
            <button type="button" class="link link--danger" @click="eliminar(c)">Eliminar</button>
          </div>
        </div>
      </li>
    </ol>

    <p v-else-if="!cargando" class="aviso">
      Todavía no hay cursos. Empieza subiendo el primero de la ruta.
    </p>
  </div>
</template>

<style lang="scss" scoped>
.cursos {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
}

.cursos__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: $space-sm;
  margin-bottom: $space-xs;
}

.cursos__eyebrow {
  @include eyebrow;
  color: $rose-deep;
}

.cursos__title {
  font-family: $font-display;
  font-size: $display-sm;
  line-height: 1.05;
  color: $ink;
}

.cursos__sub {
  margin-top: 0.25rem;
  font-size: $text-sm;
  color: $ink-soft;
}

/* ── Avisos ── */
.aviso {
  padding: $space-sm $space-md;
  border-radius: $radius-md;
  background-color: $cream;
  font-size: $text-sm;
  color: $ink-soft;

  code {
    padding: 0.05rem 0.3rem;
    border-radius: 4px;
    background-color: rgba($ink, 0.07);
    font-size: 0.8em;
  }
}

.aviso--error {
  background-color: $alert-error-bg;
  color: $alert-error;
}

.aviso--warn {
  background-color: $alert-warning-bg;
  color: $ink;
}

/* ── Botones ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba($ink, 0.2);
  border-radius: $radius-pill;
  background: none;
  font-family: inherit;
  font-size: $text-xs;
  letter-spacing: 0.05em;
  color: $ink;
  cursor: pointer;
  transition: background-color 0.28s $ease, border-color 0.28s $ease, color 0.28s $ease;

  &:hover:not(:disabled) {
    border-color: $ink;
  }

  @include focus-ring;
}

.btn--solid {
  border-color: $ink;
  background-color: $ink;
  color: $cream;

  &:hover:not(:disabled) {
    background-color: $wine;
    border-color: $wine;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.btn--mini {
  padding: 0.35rem 0.75rem;
}

/* El input de archivo del navegador es feo y no se puede estilar: se esconde */
.btn--file,
.btn--mini {
  position: relative;
  overflow: hidden;

  input[type='file'] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
}

.btn--disabled {
  opacity: 0.45;
  cursor: not-allowed;

  input {
    cursor: not-allowed;
  }
}

.link {
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: $text-xs;
  color: $rose-deep;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.link--danger {
  color: $alert-error;
}

/* ── Formulario ── */
.form {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  padding: clamp(1.1rem, 3vw, 1.6rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.form__title {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.form__fila {
  display: grid;
  grid-template-columns: 1fr;
  gap: $space-sm;

  @include from('md') {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.form__acciones {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.campo__label {
  font-size: $text-xs;
  letter-spacing: 0.06em;
  color: $ink-muted;
}

.campo input,
.campo textarea,
.clase-nueva input {
  padding: 0.7rem 1rem;
  border: 1px solid rgba($ink, 0.16);
  border-radius: $radius-md;
  background-color: $bone;
  font-family: inherit;
  font-size: $text-sm;
  color: $ink;
  resize: vertical;
  transition: border-color 0.28s $ease;

  &:focus {
    border-color: rgba($ink, 0.45);
    outline: none;
  }
}

/* ── La ruta ── */
.ruta {
  display: flex;
  flex-direction: column;
  gap: $space-sm;
  list-style: none;
}

.curso {
  display: flex;
  gap: 0.8rem;
  padding: clamp(1rem, 3vw, 1.4rem);
  border-radius: $radius-lg;
  background-color: $cream;
}

.curso__orden {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  flex: none;
}

.curso__num {
  font-family: $font-display;
  font-size: $text-base;
  font-style: italic;
  color: $rose-deep;
}

.curso__mover {
  width: 26px;
  height: 22px;
  border: none;
  border-radius: $radius-sm;
  background-color: rgba($ink, 0.05);
  font-size: 0.8rem;
  color: $ink-soft;
  cursor: pointer;
  transition: background-color 0.24s $ease;

  &:hover:not(:disabled) {
    background-color: rgba($ink, 0.12);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.curso__body {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
}

.curso__linea {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}

.curso__title {
  font-family: $font-display;
  font-size: $text-lg;
  color: $ink;
}

.curso__sum {
  font-size: $text-sm;
  color: $ink-soft;
}

.curso__meta {
  font-size: $text-xs;
  color: $ink-muted;
}

.pill {
  padding: 0.15rem 0.6rem;
  border-radius: $radius-pill;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.pill--publicado {
  background-color: $alert-success-bg;
  color: #4a7a45;
}

.pill--proximamente {
  background-color: $alert-warning-bg;
  color: #8a6410;
}

.pill--borrador {
  background-color: rgba($ink, 0.08);
  color: $ink-muted;
}

/* ── Video ── */
.video {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-top: 0.3rem;
  padding: 0.7rem 0.9rem;
  border: 1px dashed rgba($ink, 0.18);
  border-radius: $radius-md;
}

.video__info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.video__label {
  font-size: $text-sm;
  color: $ink;
}

.video__estado {
  font-size: $text-xs;
  color: $ink-muted;
}

.video__estado--falta {
  color: $alert-error;
}

.barra {
  position: relative;
  height: 22px;
  border-radius: $radius-pill;
  background-color: rgba($ink, 0.08);
  overflow: hidden;
}

.barra__relleno {
  position: absolute;
  inset: 0 auto 0 0;
  background-color: $rose;
  transition: width 0.3s $ease;
}

.barra__pct {
  position: relative;
  display: block;
  padding: 0.2rem 0.7rem;
  font-size: $text-xs;
  color: $ink;
}

.curso__toggle {
  align-self: flex-start;
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: $text-xs;
  color: $ink-muted;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

/* ── Clases ── */
.clases {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.6rem;
  border-radius: $radius-md;
  background-color: $bone;
}

.clase {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.6rem;
  border-radius: $radius-sm;
  background-color: $cream;
  font-size: $text-sm;
}

.clase__num {
  font-family: $font-display;
  font-style: italic;
  color: $rose-deep;
}

.clase__title {
  flex: 1 1 140px;
  min-width: 0;
  color: $ink;
}

.clase__estado {
  font-size: $text-xs;
  color: $ink-muted;
}

.clase__quitar {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background-color: rgba($ink, 0.06);
  font-size: 0.95rem;
  line-height: 1;
  color: $ink-soft;
  cursor: pointer;

  &:hover {
    background-color: $alert-error-bg;
    color: $alert-error;
  }
}

.clase-nueva {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.2rem;

  input {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.curso__acciones {
  display: flex;
  gap: 0.9rem;
  margin-top: 0.2rem;
}
</style>
